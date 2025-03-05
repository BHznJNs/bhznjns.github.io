# 使用 Syncthing 备份软件项目代码

>>>背景
最近买了一台二手手机用于应用测试，买前想着要买个存储大点的设备，可以兼作 U 盘使用。
当到手后发现，如果直接使用有线链接，并不能直接当作 U 盘使用（买前没有做好功课的后果😭）。
然后一番摸索，装上 [AListFlutter](https://github.com/jing332/AListFlutter) 后当作 Webdav 文件服务器使用，再在电脑端安装 RaiDrive，把手机的存储挂载到电脑的文件管理器下，作为虚拟磁盘使用。
但是由于这台二手手机的存储读写速率堪忧，如果直接将软件安装在上面的话，很有可能会出现打不开的情况。
>>>

我看着手边还剩将近 100 GB 存储空间的闲置手机陷入了沉思，开始查询一些可以安装在安卓手机上的自部署服务。在[这个列表](https://github.com/Elbullazul/awesome-android-selfhosted)中找到了 [syncthing-android](https://github.com/Catfriend1/syncthing-android) 这个项目。

在手机上安装之后，再在安装电脑端 [SyncthingWindowsSetup](https://github.com/Bill-Stewart/SyncthingWindowsSetup)，经过一番配置后（由于这两个项目都提供了图形界面，配置很方便）。

但是这里有一个小坑：需要配置忽略模式防止备份不必要的文件。这是我目前使用的忽略模式：
```
**/node_modules/
**/build/
**/target/
**/.dart_tool/
**/__pycache__/
```

除了程序代码外，游戏存档、手机相册等都可以通过这种方式进行自动备份。
