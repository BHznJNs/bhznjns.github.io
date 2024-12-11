# SSH 使用指北

本文转载自知乎文章：[别再笨笨地使用SSH了](https://zhuanlan.zhihu.com/p/716963359)

文章主要介绍被大多数人忽略的 ``SSH config``，用来灵活批量配置服务器信息，配置跳板等等。

以下为原文：

- - -

## SSH config

SSH config 作用就是可以把 SSH 相关的信息都记录到一个配置文件，可以简化操作、节约时间。

SSH config 有一个系统级的，一个用户级的。一般普通用户只关注用户级的。文件路径为 ``~/.ssh/config``。

### 基本写法

一般一个服务器写成一小段，形如：

```
Host Server1
    Hostname 172.16.0.1
    User zhangsan
    Port 22
    ServerAliveInterval 180
    IdentityFile ~/.ssh/secret_key.pem
```

这段的含义为有一个服务器：

1. 我们为它起了个名字叫 Server1
2. 它的 IP 是 172.16.0.1（也可以填 Hostname）
3. 我在上面的用户名是 zhangsan
4. SSH 服务监听端口号为 22（即默认值，也可以不写这一行）
5. ServerAliveInterval 180 表示在建立连接后，每 180 秒客户端会向服务器发送一个心跳，避免用户长时间没操作连接中断
6. 最后一行表示使用一个专用的密钥，如果没有专用的密钥则删除该行即可。

登录这台服务器的话，输入：

```shell
$ ssh Server1
```

拷贝文件（反过来就是从服务器往本地下载文件）：

```shell
$ scp /path/to/local/file Server1:/path/to/remote/
```

可以看到，这样的好处有：
（1）简洁，不需要记忆 IP 地址、端口号
（2）可以保持连接

配置免密也相同，输入以下命令并输入密码：

```shell
$ ssh-copy-id Server1
```

### 通配符

如果有一批服务器都是相同的配置，更是可以用通配符统一处理：

```
Host Server*
    User zhangsan
    Port 22
    ServerAliveInterval 180

Host Server1
    Hostname 172.16.0.1

Host Server2
    Hostname 172.16.0.2

Host Server3
    Hostname 172.16.0.3
```

相信读者已经猜到其中的含义。第一段表示所有名字为 Server 开头的服务器，他们的用户名都是 zhangsan，端口都是 22，同时都有保持连接的心跳。然后下面列了 3 台服务器，我们只需要指定它们的 IP 地址。

### 多文件管理

如果需要管理非常多的服务器，全写到一个文件里会很乱很难维护，也不方便共享。事实上，``~/.ssh/config`` 中支持引用其它文件。我一般习惯新建一个这样的配置 ``~/.ssh/config-cluster-shanghai``，在其中编写类似上文的内容。然后在 ``~/.ssh/config`` 的开头加入如下一行即可：

```
Include config-cluster-shanghai
```

事实上这里也可以用通配符，比如：

```
Include config-*
```

这样 ``~/.ssh/`` 目录下的所有 ``config-`` 开头的文件都会被引用到。

### 跳板

很多集群需要跳板机才可登录，我们需要先登录跳板机，再从跳板机登录内部机器。这会引入两个麻烦，一是登录要两次，如果配置 SSH config 还需要在跳板机也配置一份儿；二是拷贝文件十分麻烦，要拷贝两次。

对此可以这样写配置：

```
Host Jumper
    Hostname 1.2.3.4
    User zhangsan

Host Server*
    User zhangsan
    ProxyJump Jumper
    ServerAliveInterval 180

Host Server1
    Hostname 172.16.0.1

Host Server2
    Hostname 172.16.0.2
```

第一段为跳板机的登录方式，第二段中新增了一个 ProxyJump 字段，表示所有 Server 开头的服务器，在登录的时候都要从 Jumper 这个服务器跳转一下。这时候我们想登录 ``172.16.0.1``，只需要直接输入：

```shell
$ ssh Server1
$ scp /path/to/local/file Server1:/path/to/remote/
```

注意一个细节是，这种配置下我们是直接从本地登录内部服务器，所以在配置免密时，是需要把本地的公钥放到内部服务器的。

## SCP 服务器间拷贝文件

scp 的基本用法相信大家都会，上文也多次提到。但如果想在两台服务器之间拷贝文件，事实上是可以在本地执行 scp 的：

```shell
$ scp Server1:/path/to/file Server2:/path/to/file2
```

这个命令要求 Server1 可以直接访问 Server2。如果不满足这个条件，可以用本机转发，只需要增加一个参数 ``-3`` 表示用本地机器当转发机：

```shell
$ scp -3 Server1:/path/to/file Server2:/path/to/file2
```

根据评论区的一些其它建议，额外补充两个实用辅助工具，一并推荐给大家。

## tssh

tssh 可以理解成是 OpenSSH 的一个升级版客户端。它的主要能力有：

1. 快速在 SSH config 里搜索服务器
2. 更高效方便地传文件
3. 以一种简单的加密方式记住服务器密码

### 基本用法

安装方式参见[官网](https://trzsz.github.io/ssh.html)，基本上主流包管理器
都可以直接安装。在使用时，直接把 ssh 替换成 tssh 即可。在不加服务器名字直接输入 tssh 时，会弹出机器列表，按下 ``/`` 可以搜索文本（支持 Vim 键位）

### 记住密码

偶尔会遇到服务器不允许你把自己的公钥上传，这时可以使用记住密码的功能。输入以下命令，并输入密码：

```shell
$ tssh --enc-secret
Password or secret to be encoded: ***

Encoded secret for configuration: 7f28291d196d1955afa8f24a0395d8dbd3a3951fc7a79ba3ac681e5113825c
```

将它生成的这一长串 hash code

保存到你的 SSH config 中，例如，如果它是 Server1 的密码：

```
Host Server1
    Hostname 172.16.0.1
    User zhangsan
    #!! encPassword 7f28291d196d1955afa8f24a0395d8dbd3a3951fc7a79ba3ac681e5113825c
```

所有 ``#!!`` 开头的注释会被 tssh 特殊处理，它会读取其中的字段。这样我们就没有明文保存密码。不过这个方式是对称加密，安全性相对低，还是建议大家优先用 SSH 公钥而不是这种对称加密。

同时，记得把 config 文件配置合理的权限：

```shell
$ chmod 700 ~/.ssh && chmod 600 ~/.ssh/password ~/.ssh/config
```

### 传输文件

tssh 有基于 trzsz 的文件传输功能。这个功能需要服务器上安装 trzsz。trzsz 有多种语言的实现，以 Go 语言实现的版本为例，可以参照[官网](https://trzsz.github.io/go)中提示，直接用包管理器安装。

此外，一种比较通用的方式是用 release 安装，在 [GitHub Release](https://github.com/trzsz/trzsz-go/releases) 上下载合适平台的 release 文件到本地，例如 trzsz_1.1.8_linux_x86_64.tar.gz ，放到本地位置 /path/to/trzsz_1.1.8_linux_x86_64.tar.gz。

对想安装的服务器执行以下命令：

```shell
$ tssh --install-trzsz --trzsz-bin-path /path/to/trzsz_1.1.8_linux_x86_64.tar.gz <host>
```

例如想在 Server1 上安装，就执行：

```shell
$ tssh --install-trzsz --trzsz-bin-path /path/to/trzsz_1.1.8_linux_x86_64.tar.gz Server1
```

它会安装两个命令到服务器的 ``~/.local/bin/trz`` 和 ``~/.local/tsz``。可以考虑修改环境变量便于方便调用，例如如果你使用 bash：

```shell
$ echo 'export PATH="$HOME/.local/bin:PATH"' >> ~/.bashrc
$ source ~/.bashrc
```

如果想上传文件到服务器，就在服务器上输入 trz ，随后会弹出一个文件管理器让你选文件。想要下载文件就输入 ``tsz <file on server>``。（记住一定要用 tssh 登录服务器才可以使用这个功能，直接 ssh 到服务器上会不可用）。

## clustershell

想要批量操作服务器，比较经典的工具有 pssh 和 pdsh，同时也有功能强大的 Ansible。clustershell 是我最近体验很好的工具，相比 pssh 和 pdsh 的功能更加强大，具备批量 interactive shell、集群分组、输出聚合、输出对比等功能。相比 Ansible 部署方便，使用简单，用法好记忆，擅长互动。因此非常适合集群快速批量操作、集群测试和临时维护。

安装方式请参考[官网](https://clustershell.readthedocs.io/en/latest/install.html)。

### 快速配置

我总结了一个简单的使用方式是构建一个这样的目录，例如放在 ``~/clustershell``：

```
clustershell
├── groups.conf
└── groups.d
    └── servers.cfg
```

设置环境变量：

```shell
$ echo 'export CLUSTERSHELL_CFGDIR=$HOME/clustershell"' >> ~/.bashrc
$ source ~/.bashrc
```

``groups.conf`` 编写以下内容不用动：

```conf
# ClusterShell node groups main configuration file
#
# Please see `man 5 groups.conf` and
# http://clustershell.readthedocs.org/en/latest/config.html#node-groups
# for further details.
#
# NOTE: This is a simple group configuration example file, not a
#       default config file. Please edit it to fit your own needs.
#
[Main]

# Default group source
default: servers

# Group source config directory list (space separated, use quotes if needed).
# Examples are provided. Copy them from *.conf.example to *.conf to enable.
#
# $CFGDIR is replaced by the highest priority config directory found.
# Default confdir value enables both system-wide and user configuration.
confdir: $CFGDIR/groups.conf.d

# New in 1.7, autodir defines a directory list (space separated, use quotes if
# needed) where group data files will be auto-loaded.
# Only *.yaml file are loaded. Copy *.yaml.example files to enable.
# Group data files avoid the need of external calls for static config files.
#
# $CFGDIR is replaced by the highest priority config directory found.
# Default autodir value enables both system-wide and user configuration.
autodir: $CFGDIR/groups.d

# Sections below also define group sources.
#
# NOTE: /etc/clustershell/groups is deprecated since version 1.7, thus if it
#       doesn't exist, the "local.cfg" file from autodir will be used.
#
# See the documentation for $CFGDIR, $SOURCE, $GROUP and $NODE upcall special
# variables. Please remember that they are substitued before the shell command
# is effectively executed.
#
[servers]
# flat file "group: nodeset" based group source using $CFGDIR/groups.d/servers.cfg
# with backward support for /etc/clustershell/groups
map: [ -f $CFGDIR/groups ] && f=$CFGDIR/groups || f=$CFGDIR/groups.d/servers.cfg; sed -n 's/^$GROUP:\(.*\)/\1/p' $f
all: [ -f $CFGDIR/groups ] && f=$CFGDIR/groups || f=$CFGDIR/groups.d/servers.cfg; sed -n 's/^all:\(.*\)/\1/p' $f
list: [ -f $CFGDIR/groups ] && f=$CFGDIR/groups || f=$CFGDIR/groups.d/servers.cfg; sed -n 's/^\([0-9A-Za-z_-]*\):.*/\1/p' $f
```

``groups.d/servers.conf`` 编写：

```conf
# ClusterShell groups config servers.cfg
#
# Replace /etc/clustershell/groups
#
# Note: file auto-loaded unless /etc/clustershell/groups is present
#
# See also groups.d/cluster.yaml.example for an example of multiple
# sources single flat file setup using YAML syntax.
#
# Feel free to edit to fit your needs.
all: 172.16.0.[1-8]
```

all 字段列出你的服务器列表，可以是 IP、Hostname 或者 SSH config 中的 Host 代称。

如果服务器很多，IP 无规律，可以使用 clustershell 包自带的 ``cluset`` 工具帮忙。例如你有一个 IP 列表，就可以输入 ``cluset -f`` （ -f 表示 fold，折叠 IP 的意思） ，然后一行一行输入 IP，按 ``Ctrl-D`` 结束。或者如果你把 IP 保存到了一个文件 iplist 中，也可以：

```shell
$ cat iplist
172.16.0.1
172.16.0.2
172.16.0.3
172.16.0.4
$ cluset -f < iplist
172.16.0.[1-4]
```

### 基本使用与服务器分组

在 ``groups.d/servers.cfg`` 中增加新的字段即可：

```cfg
# ...
all: 172.16.0.[1-8]
group1: 172.16.0.[1-4]
group2: 172.16.0.[5-8]
```

输入以下命令对不同的服务器操作：

```shell
# 对所有服务器操作
$ clush -a echo Hello

# 对 group1 操作
$ clush -g group1 echo Hello
```

### 输出聚合

这个功能非常实用。只需要加上 -b 这个 flag，就会自动把输出相同的服务器合并输出：

```shell
$ clush -g group1 -b echo Hello
---------------
172.16.0.[1-4]
---------------
Hello
```

### Interactive Shell

不加具体的命令时，可以进入 Interactive Shell，例如：

```shell
$ clush -g group1 -b
Enter 'quit' to leave this interactive mode
Working with nodes: 172.16.0.[1-4]
clush> 
```

然后就可以当一个正常的 Shell 使用。其中还有一些[特殊命令](https://clustershell.readthedocs.io/en/latest/tools/clush.html#single-character-interactive-commands)

### 临时使用部分节点

```shell
$ clush -w 172.16.0.[2-5] -b echo Hello
```

### 输出 diff

```shell
$ clush -w 172.16.0.[2-5] --diff ls
```

### 文件分发和收集

分发文件（``-v`` 表示 verbose，多输出一些日志），只有一个路径时，会分发到所有机器的相同路径：

```shell
$ clush -v -w 172.16.0.[2-5] --copy /tmp/foo
$ clush -v -w 172.16.0.[2-5] --copy /tmp/foo /tmp/bar
```

收集文件，会自动添加后缀：

```shell
$ clush -v -w 172.16.0.[2-5] --rcopy /tmp/foo
$ ls /tmp/foo.*
/tmp/foo.172.16.0.2 /tmp/foo.172.16.0.3 /tmp/foo.172.16.0.4 /tmp/foo.172.16.0.5
```
