# 大白话解释 select

select 函数是 C 语言编程中用来实现多路 IO 复用的重要函数。你可以通过

```c
#include <sys/select.h>
```

来使用它。

- - -

## 前置知识：文件描述符

{文件描述符}(File description)，常被缩写为 fd，是 Unix 及类 Unix 系统中对于文件操作、网络操作等 IO 操作的统一抽象，将socket、标准输入输出、文件等用同一套接口来操作，这也是 Linux “万物皆文件”的由来。

## 定义

select 函数的定义如下：

```c
int select(int nfds, fd_set *readset, fd_set *writeset, fd_set *exceptset,struct timeval *timeout);
```

### ``nfds``

select 函数内部要监听的文件描述符的最高值。
也就是说，select 函数会监听在输入的文件描述符集合中，从 ``0 ~ (nfds - 1)`` 这一范围内的文件描述符，因此实际传入参数时往往需要加一，像这样：

```c
select(fd + 1, ...);
```

### ``readset``, ``writeset``, ``exceptset``

文件描述符的集合，分别对应读操作、写操作、异常。
我们可以使用 ``FD_SET`` 宏来将一个文件描述符加入集合，像这样：

```c
int fd;
fd_set read_fds;
// 将文件描述符 fd 加入读集合
FD_SET(fd, &read_fds);
```

>>> 实际使用文件描述符集合的过程
```c
fd_set read_fds;
// 将集合全部置零，相当于使用 memset
FD_ZERO(&read_fds);

int fd = ...;
// 将fd加入读集合中
FD_SET(fd, &read_fds);

// 使用 select 函数监听fd的读操作
select(fd, &read_fds, ...);
// ... 

// 判断指定 fd 的读操作是否可用
if (FD_ISSET(fd, &read_fds)) {
    // 
}

// ...

// 如果fd集合需要复用，要将fd从集合中去除
FD_CLR(fd, &read_fds);
```
>>>

### ``timeout``

select 函数的等待时间，是一个结构体，定义如下：

```c
struct timeval {
  long tv_sec;  /* Seconds. */
  long tv_usec; /* Microseconds. */
};
```

timeout 参数有三种情况：
- 为``NULL``，select 函数无限等待
- ``tv_sec`` 和 ``tv_usec`` 都为 0，不等待，立即返回
- ``tv_sec``不为 0 或 ``tv_usec`` 不为 0，等待对应的时间

- - -

说了这么多，select 函数到底有啥用？

## 监听文件描述符的状态

比如说，你需要进行网络请求，会有如下的代码：

```c
// 创建 socket
int sock_fd = socket(AF_INET, SOCK_STREAM, 0);
  
// 设置目标服务器 ip 及端口
struct sockaddr_in server_addr;
server_addr.sin_family = AF_INET;
server_addr.sin_port = htons(PORT);
server_addr.sin_addr.s_addr = inet_addr("127.0.0.1");

// 连接到服务器
connect(sock_fd, (struct sockaddr*)&server_addr, sizeof(server_addr));

// 设置fd集合及等待时间
fd_set read_fds;
struct timeval timeout;

FD_ZERO(&read_fds);
FD_SET(sock_fd, &read_fds);

timeout.tv_sec = 5;
timeout.tv_usec = 0;

int ret = select(sock_fd + 1, &read_fds, NULL, NULL, &timeout);
if (ret == -1) {
    // select 内部出错
    // 错误处理...
} else if (ret == 0) {
    // 在五秒内都不可读，即连接超时
    printf("Timeout\n");
} else {
    // socket 读状态改变
    // 检查套接字是否可读
    if (FD_ISSET(sock_fd, &read_fds)) {
        // 这里可以继续读取来自服务器的数据
    }
}

// 关闭套接字
close(sockfd);
```

在这段代码中，我们在使用 connect 连接服务器后，使用了 select 来监听 socket 文件描述符读状态的改变（因为网络连接建立需要时间，在成功建立连接之前，socket 是不可读的，监听到 socket 读状态改变，往往意味着连接建立），而 select 函数的作用就在于此，它给这个状态改变设了一个时限，在上面的代码中为 5 秒，在时限内，socket 文件描述符读状态发送变化，则函数提前返回，返回值大于 0；如果达到设定时间，则不再继续等待，直接返回 0。

那么这里又有个问题，select 函数的返回值到底有啥含义？为啥在监听到状态变化时，不直接返回 1，而是返回一个大于 0 的数？

## select 函数的返回值

前文我们已经大致提到过，select 函数的返回值有三种情况：
- 等于 -1：select 函数内部发生错误，此错误往往来自操作系统
- 等于 0：select 监听的文件描述符##都##未在指定时间内发生状态变化
- ##大于 0: select 监听的文件描述符组在指定时间内发生状态变化的文件描述符的数量##

看到上面##加粗##的文字了吗？也就是说，select 函数可以同时监听多个文件描述符的多个状态（读、写、错误），你可能也注意到了，select 函数并不直接接收文件描述符，而是接收文件描述符集合（fd set）。

>>> 文件描述符集合的结构
> 文件描述符集合，从名称上看是一个集合，实际具体实现上是一个位图。
这是网络上常见的描述。简单来说，文件描述符集合就是一个零一数组，如下代码所示（仅供帮助理解，不说明实际实现）：

```c
fd_set read_fds;
FD_ZERO(&read_fds); // [0, 0, 0, 0, ...]

int sock_fd = ...; // 初始化一个 socket，假设值为 2

// 将集合中索引为 2 的元素置一
// [0, 0, 1, 0, ...]
FD_SET(sock_fd, &read_fds);
// 可以看作：
read_fds[sock_fd] = 1;

// 上文提到过，select 的第一个参数是 “select 函数内部要监听的文件描述符的最高值”，
// 在这里，我们将 sock_fd 加上 1 传入，则 select 函数实际上会监听输入的集合的
// 第零到第 (sock_fd + 1) 位（半开区间，不包括 (sock_fd + 1)）；
// 也就是说，为了能监听到我们目标的文件描述符，我们需要将其置于监听的范围内。
select(sock_fd + 1, &read_fds, ...);
```
>>>

也就是说，如果想要同时监听多个网络请求，你完全可以写出下面这样的代码：

```c
int sock_fd1, sock_fd2;
// socket 初始化及网络连接部分代码略

fd_set read_fds;
struct timeval timeout;

FD_ZERO(&read_fds);
// 注意！这里将两个 socket 都加入到同一文件描述符集合中
FD_SET(sock_fd1, &read_fds);
FD_SET(sock_fd2, &read_fds);

timeout.tv_sec = 5;
timeout.tv_usec = 0;

int ret = select(max(sock_fd1, sock_fd2) + 1, &read_fds, NULL, NULL, &timeout);
if (ret == -1) {} // 此处代码略
else if (ret == 0) {} // 此处代码略
else {
    // 由于这里同时监听了两个 socket，当 select 函数返回时，
    // 我们无法知道是否两个 socket 的状态都发送变化（其实可以通过返回值来判断，
    // 如果返回值等于 2，就说明两个 socket 的状态都发生了变化），
    // 因此在这里逐一判断并进行对应操作
    if (FD_ISSET(sock_fd1, &read_fds)) {
        // 对 socket1 进行后续操作
    }
    if (FD_ISSET(sock_fd2, &read_fds)) {
        // 对 socket2 进行后续操作
    }
}

// ...
```

## 总结

从上面的代码，我们应该可以较明了的理解 select 函数的作用：监听多个文件描述符的多个状态（读、写、异常），当每个文件描述符都至少有一个状态可用时，或到达设定的超时时间时，select 函数返回，返回值为可用的状态总数。

例如，在使用 socket 处理多个请求的情况下，可以将多个 socket 放进同一个读文件描述符集合，对这一集合使用 select 进行监听，当所有 socket 都可读时，进行逐一处理；或超时时，对已经可读的 socket 进行处理。

## FAQs

### “但是程序在等待 select 函数返回时明明是阻塞的啊，为什么说 select 函数是用于I/O多路复用的一个重要函数呢？”

这是一个很好的问题。尽管select()函数在调用期间会阻塞当前线程，直到至少有一个描述符就绪或超时发生，但这里的关键点在于“多路复用”，即select()允许##一个进程或线程##同时监控##多个##文件描述符，而不需要为每个描述符创建一个独立的线程或进程。
