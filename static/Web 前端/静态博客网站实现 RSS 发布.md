# 静态博客网站实现 RSS 发布

## RSS 发布原理

网站发布 RSS 本质上就是更新网站的 ``rss.xml`` (或者 ``atom.xml``)，订阅者则可以通过 RSS 阅读器来获取网站最新的 RSS 文件，从而获知网站网站的最新动态。

因此，RSS 发布的核心就是生成 ``rss.xml`` 文件。

## RSS 文件格式

要知道如何生成 ``rss.xml`` 文件，我们就需要先知道文件的大致格式。

以下是 RSS 2.0 的 ``rss.xml`` 基本格式：

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">

<channel>
  <title>网站名称</title>
  <link>https://www.website.link.com</link>
  <description>网站描述</description>
  <item>
    <title>要发布的文章标题1</title>
    <link>https://www.website.link.com/article1</link>
    <description>文章描述</description>
  </item>
  <item>
    <title>要发布的文章标题2</title>
    <link>https://www.website.link.com/article2</link>
    <description>文章描述</description>
  </item>
  <!-- 更多文章... -->
</channel>

</rss>
```

由如上所示的代码，我们可以知道应该被包含在 ``rss.xml`` 文件中的内容：

1. 网站名称
2. 网站链接
3. 网站描述
4. 要发布的文章若干，其中同样包含文章标题、文章链接、文章描述
5. 一些其它的属性（作者、发布时间等）可选

那么，生成 ``rss.xml`` 文件要做哪些工作我们就大致清楚了。

## RSS 文件生成

为了让 ``rss.xml`` 文件中能够从新到旧展示博客文章，我们首先需要读取所有博客文件 (放在本站中就是所有的 markdown 文件)，再按照新旧顺序排序，选取其中最新的若干篇博客。

获取到最新的若干篇博客后，就需要开始生成 ``rss.xml`` 文件了。

我们先将最新的若干篇博客转换为对应的 RSS Item 字符串，代码如下：

```javascript
const rssItemResolver = blog => `<item>
<title>${blog.title}</title>
<link>${blog.link}</link>
<description>${blog.description}</description>
</item>
`
```

再准备一份文件整体的模板，代码如下：

```javascript
// 在这里 `rssItems` 是由 rss item 字符串组成的数组。
const rssTemplate = rssItems =>
`<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
<title>BHznJNs' Blog</title>
<link>https://bhznjns.github.io/markdown-blog/#static/</link>
<description>一个 Markdown 静态博客站。</description>
${rssItems.join("")}
</channel>
</rss>`
```

再写一个入口函数

```javascript
// 这里的 `blogPaths` 是目标博客文件的路径
function rssFileGenerator(blogPaths) {
    // 生成 `Blog` 对象数组，`Blog` 对象应包含如下属性：
    // - 标题
    // - 链接
    // - 描述
    // - 创建时间，用于排序
    const blogs = blogPaths.map(blogResolver)
    // 将博客按创建时间顺序排序
    blogs.sort((a, b) => b.createTime - a.createTime)

    const rssItems = blogs.map(rssItemResolver)
    return rssTemplate(rssItems)
}
```

将这个函数返回的内容写入到网站的 ``rss.xml`` 文件，进行部署，网站就能被 RSS 阅读器订阅了。

- - -

## 进阶 - 添加博客创建时间

现在，你虽然已经可以通过 RSS 阅读器订阅并阅读你的博客，但你会发现，你的所有博客并没有按照先后顺序排列，阅读器上也没有注上每篇博客的发布时间。

``pubDate`` 标签就能优化这一点。

为了添加这一标签，我们需要修改前文使用的 ``rssItemResolver`` 函数：

```javascript
const rssItemResolver = blog => `<item>
<title>${blog.title}</title>
<link>${blog.link}</link>
<pubDate>${timeFormater(blog.pubTime)}</pubDate>
<description>${blog.description}</description>
</item>
`
```

需要注意的是，根据[文章](https://whitep4nth3r.com/blog/how-to-format-dates-for-rss-feeds-rfc-822/#valid-rfc-822-date-format)，RSS 文档中出现的时间必须参照一定的格式，如 ``Wed, 02 Oct 2002 15:00:00 +0200``。

所以我们需要一个 ``timeFormater`` 函数：

```javascript
function addLeadingZero(num, target) {
    let numStr = num.toString();
    while (numStr.length < target) {
        numStr = "0" + numStr
    }
    return numStr;
}

const weekDayNames = [
    "Sun", "Mon", "Tue",
    "Wed", "Thu", "Fri",
    "Sat",
]
const monthNames = [
    "Jan", "Feb", "Mar",
    "Apr", "May", "Jun",
    "Jul", "Aug", "Sep",
    "Oct", "Nov", "Dec",
]
const weekDay  = date => weekDayNames[date.getDay()]
const month    = date => monthNames[date.getMonth()]
const time     = date => `${addLeadingZero(date.getHours(), 2)}:${addLeadingZero(date.getMinutes(), 2)}:00`;
const timezone = () => {
    const timezone = (-(new Date()).getTimezoneOffset() / 60)
    return (timezone >= 0 ? "+" : "-") + addLeadingZero((timezone * 100).toString(), 4)
}

const timeFormater = date =>
    `${weekDay(date)}, ${date.getDate()} ${month(date)} ${date.getFullYear()} ${time(date)} ${timezone(date)}`
```

修改如上代码后再次部署，再在 RSS 阅读器中查看，你会发现你的博客已经按照发布时间排序好了，并且对于每篇博客也会显示对应的发布时间。

本文完，感谢阅读。
