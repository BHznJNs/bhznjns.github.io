# 通过 DNS 服务获取域名对应 Host

在编写 TCP/HTTP 客户端请求程序时，通过 DNS 服务获取域名对应的 IP 地址是非常常见的需求。

针对这一需求，在使用 Rust 进行开发时，我们主要有两种方式来实现。 

## 标准库

Rust 的 ``std::net`` 标准库中有一个名为 ``ToSocketAddrs`` 的 trait，它可以将表示主机地址的字符串转化为 ``SocketAddr`` 的迭代器，也可以对域名调用操作系统的 DNS 查询函数获取对应的 IP 地址，同样返回 ``SocketAddr`` 的迭代器。

``tokio`` 的内部使用此方式实现 DNS 查询。见[此文件183行](https://github.com/tokio-rs/tokio/blob/master/tokio/src/net/addr.rs)

> [important]
> 使用 ``ToSocketAddrs`` 解析主机地址时必须带上端口，如
> ```rust
> "127.0.0.1:4000".to_socket_addrs();
> "localhost:4000".to_socket_addrs();
> "google.com:80".to_socket_addrs();
> ```
> 
> - - -
> 
> 你也可以使用 IP/域名 + 端口 的元组来解析，像这样：
> 
> ```rust
> ("127.0.0.1", 4000).to_socket_addrs();
> ("localhost", 4000).to_socket_addrs();
> ("google.com", 80).to_socket_addrs();
> ```

## 操作系统 C 库

Rust 具备调用 C 库的能力，在库[dns-lookup](https://crates.io/crates/dns-lookup)的源码中，其调用了操作系统的 ``getaddrinfo`` 函数。

如果你使用 C 语言进行过 socket 网络编程，你对 ``gethostbyname`` 这个函数应该不陌生。
根据 [StackOverflow 上的这篇帖子](https://stackoverflow.com/questions/52727565/client-in-c-use-gethostbyname-or-getaddrinfo)，``gethostbyname()`` 和 ``gethostbyaddr()`` 这两个函数不被鼓励使用，因为它们并不具备对 IPv6 的支持。而 ``getaddrinfo()`` 和 ``getnameinfo()`` 正对应着上文的两个函数，并且它们支持 IPv6。
