# scrcpy-server 编译

Clone 项目：

```bash
git clone https://github.com/Genymobile/scrcpy
```

在 Android Studio 中打开项目，跟随 IDE 指引配置好项目的 SDK、gradle 等

通过 MINGW64 的终端（Git 自带的 Git bash 或者 MSYS2）运行 shell 脚本：
```bash
./server/scripts/build-wrapper.sh ./server server/scrcpy-server release
```

``scrcpy-server`` 可执行文件就会被构建在 ``server`` 目录下了。
