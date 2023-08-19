# Firefox 启用亚克力效果

本文适用于 Windows 11 操作系统。

``2023/8/19``

- - -

## 安装 MicaForEveryone

Github 地址：[MicaForEveryone](https://github.com/MicaForEveryone/MicaForEveryone)

安装后，点击左下角添加新规则，输入 firefox。规则中标题栏颜色为“由应用程序决定”，模糊类型为“亚克力”。

## 安装 WaveFox

Github 地址：[WaveFox](https://github.com/QNetITQ/WaveFox)

到浏览器 ``about:config`` 页面，添加如下规则：

```
userChrome.DarkTheme.TabFrameColor.Black.Enabled
userChrome.DarkTheme.TabFrameSaturation.VeryHigh.Enabled
userChrome.DarkTheme.TabFrameType.Border.Enabled
userChrome.LightTheme.TabFrameColor.Auto.Enabled
userChrome.LightTheme.TabFrameType.Shadow.Enabled
userChrome.TabSeparatorsMediumSaturation-Enabled
userChrome.Tabs.Option8.Enabled
userChrome.Windows.SystemEffects.Enabled
```

重启浏览器即可
