# HTML 实现拼音注音及美化

``2024/01/01``

- - -

这个需求放在五六年前可能实现起来还会麻烦一些，但是现在，主流浏览器都已经支持（并且兼容性良好）用于东亚文字注音的 HTML 标签 ``<ruby>``。

## 用法

这一标签的用法十分简单，看如下代码：

```xml
<ruby>
  汉 <rp>(</rp><rt>han</rt><rp>)</rp> 字 <rp>(</rp><rt>zi</rt><rp>)</rp>
</ruby>
```

将需要注音的汉字直接放在 ``<ruby>`` 下，将拼音写在 ``<rt>`` 标签下，``<rp>`` 标签用于兼容不支持 ``<ruby>`` 标签的浏览器。

在支持 ``<ruby>`` 标签的浏览器下，上面这段 HTML 代码看起来会像这样：

@@@
<ruby>
  汉 <rp>(</rp><rt>han</rt><rp>)</rp> 字 <rp>(</rp><rt>zi</rt><rp>)</rp>
</ruby>
@@@

在不支持 ``<ruby>`` 标签的浏览器下，上面这段 HTML 代码看起来会像这样：

@@@
<p>汉(han)字(zi)</p>
@@@

- - -

## 拼音位置偏移

你可能会发现，上面的拼音渲染中，拼音的位置有些偏移，这是由于 HTML 空白字符的影响。让我们删除 HTML 代码中的空格和换行，再看看效果：

```xml
<ruby>汉<rp>(</rp><rt>han</rt><rp>)</rp>字<rp>(</rp><rt>zi</rt><rp>)</rp></ruby>
```

@@@
<ruby>汉<rp>(</rp><rt>han</rt><rp>)</rp>字<rp>(</rp><rt>zi</rt><rp>)</rp></ruby>
@@@

现在，拼音便能完美的对应上相应字符的位置了。

- - -

## 美化

我们将上面的 HTML 代码进行修改，添加一些元素（为了让代码可读性更强，添加了换行和空格，实际使用中应删去）：

```xml
<ruby>
    <span class="notation-container">
        <span>ming tian</span>
    </span>
    <span class="text-container">
        <span>明天</span>
    </span>
    <rp>(</rp>
    <rt>ming tian</rt>
    <rp>)</rp>
</ruby>
```

在添加 CSS 代码：

```css
.notation-container span,
.text-container span {
    /* 避免文字换行影响动画效果 */
    white-space: nowrap;
    min-width: 0;
}

.notation-container {
    /* 使用 grid，实现宽度从零到自动的变化 */
    display: grid;
    grid-template-columns: 0fr;

    opacity: 0;
    user-select: none; /* 不让该元素中的文字被选择 */
    transition: .3s .15s;
}
.notation-container span {
    min-width: 0;
}

.text-container {
    /* 使用 grid，实现宽度从零到自动的变化 */
    display: grid;
    grid-template-columns: 1fr;

    opacity: 1;
    transition: .3s;
}
.text-container span {
    min-width: 0;
}

ruby rt {
    position: relative;
    top: 0;
    transition: .3s;
}
ruby:hover rt {
    /* 这两行用于使 `rt` 元素上下移动，由于浏览器表现不同，使用不同代码实现。 */
    top: 2em; /* 用于 Firefox */
    transform: translateY(2em); /* 用于 Chrome/Edge */
    opacity: 0;
}
ruby:hover .text-container {
    /* 隐藏被注音的文字 */
    grid-template-columns: 0fr;
    opacity: 0;
}
ruby:hover .notation-container {
    /* 展现拼音 */
    grid-template-columns: 1fr;
    opacity: 1;
}
```

效果如下👇，你可以放上鼠标试一试

@@@
<style>
.notation-container span,
.text-container span {
    white-space: nowrap;
    min-width: 0;
}

.notation-container {
    display: grid;
    grid-template-columns: 0fr;

    opacity: 0;
    user-select: none;
    transition: .3s .15s;
}
.notation-container span {
    min-width: 0;
}

.text-container {
    display: grid;
    grid-template-columns: 1fr;

    opacity: 1;
    transition: .3s;
}
.text-container span {
    min-width: 0;
}

ruby rt {
    position: relative;
    top: 0;
    transition: .3s;
}
ruby:hover rt {
    top: 2em;
    transform: translateY(2em);
    opacity: 0;
}
ruby:hover .text-container {
    grid-template-columns: 0fr;
    opacity: 0;
}
ruby:hover .notation-container {
    grid-template-columns: 1fr;
    opacity: 1;
}
</style>
你好你好
<ruby><span class="notation-container"><span>ming tian</span></span><span class="text-container"><span>明天</span></span><rp>(</rp><rt>ming tian</rt><rp>)</rp></ruby>
测试测试
@@@
