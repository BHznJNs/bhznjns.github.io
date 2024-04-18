# JavaScript 实现容器元素横向滚动

在我编写一个动态 Tabbar 组件时，经过搜索引擎查询发现，浏览器并没有提供成熟的 API 供开发者进行横竖向滚动的切换，于是便有了这篇博客。

## 可能的实现方案

参考掘金文章[什么？CSS 能实现鼠标滚轮的横向滚动？](https://juejin.cn/post/7247499914913202213)，通过 CSS 同时对容器元素和内容元素进行相反方向的旋转操作，实现将竖直方向上的滚动操作转化为看起来像是横向的滚动。

## JavaScript 实现方案

此方案最大的优势即基本无需修改原有 HTML 及 CSS 代码，只需添加少量 JavaScript 代码，具有一定的通用性。

下面为 Tabbar 组件的代码结构：

```css
body {
    height: 3rem;
}
.container {
    display: flex;
    gap: 1rem;
    width: 300px;
    height: 2rem;
    overflow-x: auto;
    overflow-y: hidden;
}
.item {
    text-wrap: nowrap;
}
```

```xml
<body>
<div class="container">
    <div class="item">test content</div>
    <div class="item">test content</div>
    <div class="item">test content</div>
    <div class="item">test content</div>
    <div class="item">test content</div>
    <div class="item">test content</div>
    <div class="item">test content</div>
    <div class="item">test content</div>
</div>
</body>
```

@@@
<style>
body {
    height: 3rem;
}
.container {
    display: flex;
    gap: 1rem;
    width: 300px;
    height: 2rem;
    overflow-x: auto;
    overflow-y: hidden;
}
.item {
    text-wrap: nowrap;
}
</style>
<body>
<div class="container">
    <div class="item">test content</div>
    <div class="item">test content</div>
    <div class="item">test content</div>
    <div class="item">test content</div>
    <div class="item">test content</div>
    <div class="item">test content</div>
    <div class="item">test content</div>
    <div class="item">test content</div>
</div>
</body>
@@@

添加 JavaScript 事件监听：

```javascript
const targetEl = document.querySelector(".container")
targetEl.addEventListener("wheel", e => {
    const { deltaX, deltaY } = e
    const left = deltaY || deltaX / 2
    targetEl.scrollLeft += left
})
```

@@@
<style>
body {
    height: 3rem;
}
.container {
    display: flex;
    gap: 1rem;
    width: 300px;
    height: 2rem;
    overflow-x: auto;
    overflow-y: hidden;
}
.item {
    text-wrap: nowrap;
}
</style>
<body>
<div class="container">
    <div class="item">test content</div>
    <div class="item">test content</div>
    <div class="item">test content</div>
    <div class="item">test content</div>
    <div class="item">test content</div>
    <div class="item">test content</div>
    <div class="item">test content</div>
    <div class="item">test content</div>
</div>
</body>
<script>
const targetEl = document.querySelector(".container")
targetEl.addEventListener("wheel", e => {
    const { deltaX, deltaY } = e
    const left = deltaY || deltaX / 2
    targetEl.scrollLeft += left
})
</script>
@@@

这里监听了 ``wheel`` 事件，其中事件对象的 ``deltaX`` 和 ``deltaY`` 属性即为该次滚动理论上会滚动的滚动量。

于是，这里代码的目的就明了了：对于我们的目标元素，在其上进行滚轮滚动操作本不会对其进行水平方向上的滚动，但是这里通过事件监听读取了其竖直方向上的滚动量并将该滚动量手动施加到目标元素的水平方向，形成了水平滚动的效果。
