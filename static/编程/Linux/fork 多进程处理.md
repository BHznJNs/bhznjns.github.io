# fork 多进程处理

## fork 创建子进程

fork 函数能复制当前进程，创建一个具有相同数据的子进程，通过在调用 fork 函数后在父子进程中判断 fork 函数的返回值以区分父子进程的行为。

```c
pid_t child_pid = fork();

if (child_pid == -1) {
    // error
} else if (child_pid == 0) {
    // in child process
} else {
    // in parent process
}
```

## wait 函数等待子进程运行结束

wait 函数会阻塞父进程，直到出现已经退出的子进程

```c
int statloc;
wait(&statloc);
int exitcode = WEXITSTATUS(statloc);
int bysignal = WIFSIGNALED(statloc);
```

对于 ``waitpid``, ``wait3``, ``wait4`` 函数，可以将其设置为 ``WNOHANG`` 使其立即返回。

## 使用 kill 中断子进程

```c
kill(child_pid, SIGKILL);
```
