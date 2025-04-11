# 一次 Python GUI 框架的选择

## 为什么要使用 Python 写 GUI 程序？

这得说到我最近在维护的开源项目 [InputShare](https://github.com/BHznJNs/InputShare) 了。

这个项目最开始是没有图形界面的，我想着使用 Python 的话一方面能够快速验证，另一方面 Python 的社区资源足够丰富，就选择使用 Python 编写原型。

在软件基本可用后，我想着给它加上一个易用的图形界面方便我自己使用，也能让软件方便推广。此时我依然延续了原型设计的思维，选择了我还算熟悉并且能够快速做出界面的 tkinter 和 [CustomTkinter](https://customtkinter.tomschimansky.com/)
但是在最近，我想要改动设置界面，将设置项进行分组，并添加新的设置项，我发现相关的 UI 代码很难修改。
同时，我尝试使用英文版本界面录制推广视频时，意外发现 CustomTkinter 没有自带文本溢出换行！我需要手动在文本中添加 ``\\\n`` 来实现换行！

于是我开始尝试使用其它的 Python GUI 框架进行重构。

## 我调研了哪些替代品？

大概内容可以参考[这个 issue](https://github.com/BHznJNs/InputShare/issues/32)

我先后调研了如下 GUI 框架：

### [Flet](https://flet.dev/)

看起来很好，是 Flutter 的 Python 封装，跨平台性很好，并且自带多平台构建支持。
经过基本了解后我发现 Flet 并不很适用于 InputShare 这种主要运行在后台的应用，使用这个框架可能需要大幅重构项目，遂放弃。

### PyQt + [QFluentWidgets](https://qfluentwidgets.com/)

基于成熟的 PyQt，并且使用的 fluent design 也足够美观。
但是我在尝试的过程中发现其文档并不好懂，很多好用一些的组件需要付费，并且官方的 Gallery 实例的性能并不好，目测只有 30 帧。

### [pywebview](https://github.com/r0x0r/pywebview)

封装了原生的 Webview 并提供 Python Binding，可以使用 Web 前端代码开发界面，也提供了 Python 和 JavaScript 的通信支持，看起来很美好。

但是这个库控制的窗口没有黑暗模式的支持，即使[当系统处于黑暗模式时，窗口的边框依然处于日间模式](https://github.com/r0x0r/pywebview/issues/1494)。
我尝试过将窗口设为无边框，库倒是有将 DOM 元素设为窗口可拖拽区域的支持，但是在无边框模式下窗口[无法被鼠标调整大小](https://github.com/r0x0r/pywebview/issues/1510)。

遂放弃。

### [webui](https://github.com/webui-dev/webui)

这个项目另辟蹊径，使用系统安装的浏览器作为应用窗口，并提供包含 Python 在内的多语言支持。
但是在我把示例代码跑起来后就发现了问题，如[这个 issue](https://github.com/webui-dev/webui/issues/550) 中所示。遂放弃。

### PyQt + QtWebEngine（尝试中）

我在放弃 webui 后想到，要展示前端界面，我未必非得用专门的框架。像 PyQt 这样框架就已经有成熟的 Webview 支持了。
我在成功把内嵌 Webview 的 Qt 窗口运行之后，尝试封装一个[专门的库](https://github.com/BHznJNs/PyQWebWindow)用于展示前端界面。--为了这盘醋包了顿饺子了属于是--。

## 这个经历给了我两个教训

1. Python 真的不适合用于图形界面程序开发。
2. 引自《程序员修炼之道》，不要把原型用于产品。

文章最后，是《程序员修炼之道》的原文引用：
> ## 不要把原型用于产品
> 在开始任何基于代码的原型开发之前，请确保每个人都理解，正在编写的是一次性代码。原型可能有着欺骗性的外表，对那些不知道这只是原型的人产生吸引力。你必须非常清楚地表明该代码是用完即弃的，它并不完整也不可能做到完整。
> 如果你觉得所在的环境或文化中，原型代码的目的很有可能被误解，那么最好使用曳光弹的方法。这样，最后你可以做出一个坚实的框架，在此基础上进行未来的开发。

- - -

## 原型开发和曳光弹开发的区别

原型开发时会使用自己最熟悉的工具，__尽可能快地__开发出 MVP，验证想法。
曳光弹开发模式则应该在开始开发前先做好技术选型，尽量__使用合适的语言和框架__开始项目。
