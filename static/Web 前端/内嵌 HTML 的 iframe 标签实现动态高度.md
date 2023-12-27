# 内嵌 HTML 的 iframe 标签实现动态高度

``2023/12/27``

- - -

## 内嵌 HTML 的 iframe

HTML 的 ``iframe`` 标签有属性 ``srcdoc``，你可以使用这一属性直接将一段 HTML 代码内嵌在另一份 HTML 文档中，就像这样：

```xml
<iframe srcdoc="<h1>Hello World!</h1>"></iframe>
```

展示效果：

@@@
<iframe srcdoc="<h1>Hello World!</h1>"></iframe>
@@@

## 实现动态高度

本文中通过 ``postMessage`` 在 iframe 内部向父窗口发送 iframe 内容的高度信息。

首先，我们需要在被内嵌的 HTML 代码中加入如下代码：

```javascript
<script>
// 在 iframe 加载完成时执行
window.addEventListener("load", (e) => {
    // 获取 iframe 的根节点（html 节点）
    const iframeRootEl = e.target.documentElement
    // 获取父窗口
    const parent = window.parent
    // 获取 iframe 内容高度
    const height = parseFloat(getComputedStyle(iframeRootEl).height)
    // 向父窗口发送高度信息
    parent.postMessage({
        height,
        id: "...", // 此为 iframe 元素的 id，父窗口可以用于寻找信息对应的 iframe 元素
    }, "*") // 此参数可以防止数据因安全原因被拦截
})
</script>
```

再在父窗口中加入如下监听代码：

```javascript
window.addEventListener("message", (e) => {
    if (e.origin != "null") {
        // 由于内嵌 HTML 的 iframe 发送的信息事件中的
        // `origin` 属性为 "null"，我们可以以此屏蔽
        // 其它的 iframe 发送的信息
        return
    }
    // 由于这里的信息事件中不包含发送信息的 iframe 元素，我们需要
    // 由 iframe 元素主动发送 id 以查找对应的 iframe 元素
    const { id, height } = e.data
    const targetIframeEl = document.getElementById(id)
    // 设置对应的 iframe 元素的高度
    targetIframeEl.style.height = height + "px"
}, false)
```

