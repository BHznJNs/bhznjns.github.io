# Flutter Android 应用无法升级？

在刚开始开发 Flutter 应用时，我就注意到了一个问题，Flutter 应用的版本号很特殊，像这样：

```yaml
version: 1.0.0+1
```

我在开发时其实已经遇到问题了，具体表现就是没法直接安装 release 版本安装包，需要卸载当前已经安装的版本再安装。
我当时没太在意，只是以为是 debug 版本和 release 版本不兼容，直到后来有个用户和我反馈说应用无法升级到新版本，我才重视起来。

经过一番查询，我发现是 ``build-number`` 导致的，即版本号后边的那个数字。build-number 对应的是 ``AndroidManifest.xml`` 中的 ``versionCode``，需要在每次版本更新后递增。
