# 一个 GUI 多进程通信方案的选择

最近为了改进优化 [InputShare](https://github.com/BHznJNs/InputShare) 的图形界面部分，在进行了[技术选型](一次%20Python%20GUI%20框架的选择.md)之后，决定自己基于 PySide6 编写一个类似于 tauri 的基于 Web 技术的 GUI 开发框架 [PyQWebWindow](https://github.com/BHznJNs/PyQWebWindow)。

由于 InputShare 这个项目主要还是一个运行在用户后台的应用程序，所以在重写设置界面的时候我就发现了 PyQWebWindow 的不足：由于 Qt 的限制，使用 PyQWebWindow 创建的窗口是没法运行在子线程中的，但经过查询，让 Qt 的 Application 运行在子进程中是可行的，但是进程间的通信相较线程间的通信要麻烦很多，于是我开始了一系列{进程间通信}(IPC) 的尝试。

## 方案一：每次调用时启动进程，使用 ``Queue`` 通信

最开始时，我的代码很简单，就是在需要打开设置界面时，启动一个子进程，在启动时传入一个 ``multiprocessing.Queue`` 用于通信。大概的代码如下所示：

```python
import threading
import multiprocessing

def settings_window_runner(queue: multiprocessing.Queue):
    i18n = get_i18n()
    result = None

    def config() -> dict:
        config_ = get_config()
        return asdict(config_)

    def save_config(config: dict):
        nonlocal result, window
        result = config
        window.close()

    def setting_finished_callback():
        nonlocal window
        window.close()

    app = QAppManager(theme=get_config().theme)
    window = QWebWindow(
        title=i18n(["InputShare Settings", "输入流转 —— 设置"]),
        icon=str(ICON_ICO_PATH.absolute()),
        size=(720, 400),
        minimum_size=(600, 360),
    )
    window.event_listener\
        .add_event_listener("window_close_requested", setting_finished_callback)
    window.register_bindings([
        config, save_config,
    ])
    window.load_file(str(SETTINGS_PAGE_PATH))
    window.start()
    app.exec()
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
我尝试使用进程池来消除子进程创建带来的开销。

```python
from concurrent.futures import ProcessPoolExecutor

executor = ProcessPoolExecutor(1)

def open_settings_window() -> threading.Thread:
    def inner():
        future = executor.submit(settings_window_runner)
        result = future.result()
```

## 方案二：使用 ``QLocalServer`` 和 ``QLocalSocket``

我查询资料后得知，Qt 自身就有提供跨进程通信的相关库。
