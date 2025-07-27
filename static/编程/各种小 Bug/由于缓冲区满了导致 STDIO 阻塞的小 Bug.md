# 由于缓冲区满了导致 STDIO 阻塞的小 Bug

## 背景

这个 Bug 的原因就写在标题了，那我是怎么写出这个 Bug 的？这就要提到我最近项目中的一个通过 STDIO 与另一个程序进行通信的模块了。由于那个程序是通过 STDOUT 来输出数据，STDERR 输出日志，于是我最初是这么写的：

```python
process = subprocess.Popen(
    args=args,
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True,
    bufsize=1,
    encoding="utf-8",
)

assert process.stdin is not None
assert process.stdout is not None

# wait for init
while process.stdout.readline() != "[__INIT__]\n": pass
self._loaded.set()

while True:
    # 向 stdin 写入值或从 stdout 读值

returncode = ...
if returncode == 0: return
for error_message in process.stderr.readlines():
    print(error_message)
```

这段代码的思路很好，只有在子进程运行出错时才打印日志。但是，我在实际使用时却发现，程序在运行一段时间后，子进程就未响应了❓

我最初意味是子进程中哪里阻塞了，花了很多时间看源码，排查，但都无果。

## 那我是怎么发现问题的？

我在尝试复现 bug 时，为了方便查看子进程的日志，将子进程的 STDERR 重定向到了一个日志文件，奇怪的是，这一回程序怎么跑都正常。

我突然想到，有没有可能是缓冲区的问题？

于是--问了问万能的 AI 爹--查了下 Windows 上缓冲区的大小，以及 STDERR 的缓冲区满了对 STDOUT 的影响，果不其然，就是缓冲区的问题。

之前的代码必须等到子进程运行结束，STDERR 的缓冲区才会被读取，改成重定向到日志之后，就会变成 STDERR 中一有东西，就被读取，写入日志文件中，缓冲区自然就不会满了。
