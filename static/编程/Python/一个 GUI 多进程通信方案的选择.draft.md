# 一个 GUI 多进程通信方案的选择

最近为了改进优化 [InputShare](https://github.com/BHznJNs/InputShare) 的图形界面部分，在进行了[技术选型](一次%20Python%20GUI%20框架的选择.md)之后，决定自己基于 PySide6 编写一个类似于 tauri 的基于 Web 技术的 GUI 开发框架 [PyQWebWindow](https://github.com/BHznJNs/PyQWebWindow)。

由于 InputShare 这个项目主要还是一个运行在用户后台的应用程序，所以在重写设置界面的时候我就发现了 PyQWebWindow 的不足：由于 Qt 的限制，使用 PyQWebWindow 创建的窗口是没法运行在子线程中的，但经过查询，让 Qt 的 Application 运行在子进程中是可行的，但是进程间的通信相较线程间的通信要麻烦很多，于是我开始了一系列{进程间通信}(IPC) 的尝试。

## 方案一：每次调用时启动进程，使用 ``Queue`` 通信

最开始时，我的代码很简单，就是在需要打开设置界面时，启动一个子进程，在启动时传入一个 ``multiprocessing.Queue`` 用于通信。大概的代码如下所示：

```python
import threading
import multiprocessing

def settings_window_runner(queue: multiprocessing.Queue):
    result = None
    # 省略窗口自身逻辑
    queue.put(result)

def open_settings_window() -> threading.Thread:
    def inner():
        result_queue = multiprocessing.Queue()
        window_process = multiprocessing.Process(
            target=settings_window_runner,
            args=[result_queue],
        )
        window_process.start()
        window_process.join()

        result: str | None = result_queue.get()
        if result is None: return
        new_config = ConfigManager.parse_config_json(result)
        get_config_manager().use_new_config(new_config)

    background_thread = threading.Thread(target=inner, daemon=True)
    background_thread.start()
    return background_thread
```

逻辑没有问题，在单独测试启动设置窗口时也很正常。但在项目中实际运行时，我马上就发现了问题：窗口启动得太慢了。我打了日志发现，从调用 ``open_settings_window`` 方法到窗口实际出现，差不多花了四秒左右的时间，这已经是不可接受的延迟了。

查询资料后发现，由于在启动子进程时，无论父进程有没有 import 过 PySide6 这个库，子进程中都会再 import 一次。由于 PySide6 这个库本身的 import 就需要一定的时间，加上创建进程带来的开销，共同组成了这四秒左右的延迟。

## 方案二：使用进程池

既然每次调用时启动子进程的延迟主要来自于进程创建，那我只要不创建进程不就解决了吗？
于是我开始尝试使用进程池来消除子进程创建带来的开销。

```python
from concurrent.futures import ProcessPoolExecutor

executor = ProcessPoolExecutor(1)

def settings_window_runner():
    result = None
    # 省略窗口自身逻辑
    return result

def open_settings_window() -> threading.Thread:
    def inner():
        future = executor.submit(settings_window_runner)
        result = future.result()
        # 使用任务返回的结果

    background_thread = threading.Thread(target=inner, daemon=True)
    background_thread.start()
    return background_thread
```

使用这种方案的话，runner 的编写更符合直觉，且由于使用了进程池，在实际运行 runner 时，少了启动进程带来的开销，速度快了很多。
但是由于 Qt 的限制，在同一进程中不能反复启动 QApplication，此方案作废。

## 方案三：使用 QApplication 单例

在整个程序的生命周期中只启动一个 QApplication，通过 IPC 来启动窗口和返回任务结果。
这也是我的项目中最终敲定使用的方案，最终实现如下：

```python
import asyncio
import atexit
from multiprocessing import Process
from typing import Any, Callable, Iterable, TypeVar
from PyQWebWindow.MqIpc.server import IpcServer
from PyQWebWindow.utils import Serializable
from utils.network.port_check import find_available_port

_TaskResult = TypeVar("_TaskResult")

class WindowManager:
    _server: IpcServer
    _worker: Process

    @staticmethod
    def _initializer(debugging: bool, ipc_port: int):
        from PyQWebWindow.all import QAppManager, QWebWindow, IpcClient

        def run_task_handler(task: Callable[[IpcClient, Any], QWebWindow], *args):
            nonlocal window_pool
            if task in window_pool:
                window = window_pool[task]
                window.focus()
                return

            window = task(client, *args)
            window_pool[task] = window
            window.window.closed.connect(lambda: window_pool.pop(task))

        def exit_handler():
            nonlocal app, client
            client.stop()
            app.quit()

        app = QAppManager(debugging=debugging, disable_gpu=not debugging, auto_quit=False)
        window_pool: dict[Callable[[IpcClient, Any], QWebWindow], QWebWindow] = {}
        client = IpcClient(port=ipc_port)
        client.on("run-task", run_task_handler)
        client.on("process-exit", exit_handler)
        app.use_ipc_client(client)
        app.exec()

    @staticmethod
    def init(debugging: bool = False):
        ipc_port = find_available_port(5556)
        WindowManager._server = IpcServer(port=ipc_port)
        WindowManager._server.start()
        WindowManager._worker = Process(target=WindowManager._initializer, args=[debugging, ipc_port])
        WindowManager._worker.start()
        atexit.register(WindowManager.shutdown)

    @staticmethod
    def shutdown():
        WindowManager._server.emit("process-exit")
        WindowManager._worker.join()
        WindowManager._server.stop()

    @staticmethod
    def submit_and_wait(
        task: Callable,
        _t: _TaskResult,
        args: Iterable[Any] = [],
    ) -> _TaskResult:
        async def run_task() -> _TaskResult:
            loop = asyncio.get_running_loop()
            fut = loop.create_future()

            server = WindowManager._server
            server.emit("run-task", task, *args) # type: ignore
            server.once("task-completed",
                lambda res: loop.call_soon_threadsafe(fut.set_result, res)) # type: ignore
            return await fut
        return asyncio.run(run_task())

    @staticmethod
    def submit_and_then(
        task: Callable,
        callback: Callable[[_TaskResult], Any],
        args: Iterable[Serializable] = [],
    ):
        server = WindowManager._server
        server.emit("run-task", task, *args) # type: ignore
        server.once("task-completed", lambda res: callback(res))
```

简单来说，就是自己实现了一个类似于进程池的结构，在程序初始化时就启动子进程，并在子进程中启动 QApplication 实例（同时设置 QApplication 不在所有窗口关闭后退出），这个 QApplication 会存在于整个程序的生命周期。通过两个 submit 方法（``submit_and_wait`` & ``submit_and_then``）向 manager 中提交任务；manager 中在收到任务后执行则启动窗口。在 runner 中通过 emit ``task-completed`` 事件来提交结果，再通过 IPC 将结果传到主进程。

## 具体的事件通信的实现

上面只是
