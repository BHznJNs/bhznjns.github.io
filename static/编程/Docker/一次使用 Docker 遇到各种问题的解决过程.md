# 一次使用 Docker 遇到各种问题的解决过程

今天，我一时兴起，想要尝试部署一个 Google Gemini 的 API key 池，一番寻找，发现了[这个项目](https://github.com/snailyp/gemini-balance)很符合我的需求，遂尝试部署。

## Docker 由于 WSL 损坏无法使用

这个项目需要使用 Docker 部署，但是我的电脑由于 WSL 损坏且之前尝试过无法恢复，无法使用 Docker。
今天又一次尝试，在检索后，发现了[这个帖子](https://stackoverflow.com/questions/78879806/docker-desktop-wsl-update-failed)似乎符合我的情况，于是开始尝试。

1. 确保没有正在等待的 Windows 更新
2. 卸载 Docker Desktop（可能无须卸载也能成功）
3. 在“开启关闭 Windows 特性”中关闭“Windows Subsystem for Linux”

![关闭“Windows Subsystem for Linux”](https://i.sstatic.net/V8FzJLth.png)

4. 从这里 Releases · microsoft/WSL · GitHub 安装最新版本的 WSL（或者也可以使用命令行：wsl --install or wsl.exe --install）
5. 使用命令 wsl --status 确保安装
6. 重新安装 Docker Desktop

## Docker 无法使用代理

很简单：启用 Clash 的虚拟网卡模式（TUN 模式），并关闭全局代理。
如果无法联网，可以按照[官方文档](https://www.clashverge.dev/faq/windows.html)的方法，打开网络设置，删除多余网卡即可。

## 将 Docker 镜像移到其它盘 

有两种方式：

### 使用 Docker Desktop 自带的设置

![Docker Desktop 设置](https://i.sstatic.net/3zn1b.png)
直接选择目标位置即可。

### 建立链接

将 ``C:\Users\<UserName>\AppData\Local\Docker`` 移动到其它的盘上，在有管理员权限的 CMD 中运行命令：
```cmd
mklink /j "C:\Users\<UserName>\AppData\Local\Docker" "新路径"
```
