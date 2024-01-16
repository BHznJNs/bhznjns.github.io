export default {
    /**
     * homepage: String
     * the URL that this site deployed, is used to generate the rss.xml file
     * 此站点部署的 URL，用于生成 rss.xml 文件
     */
    homepage: "https://bhznjns.github.io/markdown-blog/",

    /**
     * title: String
     * the title of blog HTML document, will be shown in the tabbar of browser
     * 博客 HTML 文档的标题，会被展示在浏览器的标签栏
     */
    title: "BHznJNs' Blog",

    /**
     * footer: String
     * the footer for this site, can be deleted if you do not need it
     * 站点的脚注，如果你不需要可以删除
     */
    footer: "::Powered by [MarkdownBlog](https://github.com/BHznJNs/markdown-blog)::",

    /**
     * language: String
     * "zh" => Simplified Chinese 简体中文
     * "en" => English            英文
     */
    language: "zh",

    /**
     * enableRSS: Boolean
     * used to enable / disable the RSS function, if you do not want add blogs in some directory to the `rss.xml` , just add it into the `rssIgnoreDir`
     * 用来启用/禁用 RSS 发布功能，如果你不想将某些文件夹的内容添加到 `rss.xml` 中，将其添加到 `rssIgnoreDir` 中
     */
    enableRSS: true,
    rssIgnoreDir: [
        // directories in `static`
        "学习笔记/"
    ],

    /**
     * enableNewest: Boolean | Object<value: Boolean, ignoreDir: [String]>
     * used to enable / disable the Newest function, if you do not want add blogs in some directory, just add it into the `newestIgnoreDir`
     * 用来启用/禁用 最新博文 功能，如果你不想将某些文件夹的内容添加到其中，将其添加到 `newestIgnoreDir` 中
     */
    enableNewest: true,
    newestIgnoreDir: [],

    /**
     * pageCapacity: Number
     * defined the amount of the items in every page
     * 定义每一页展示的博文数
     */
    pageCapacity: 10,

    /**
     * RSSCapacity: Number
     * defined the amount of the items in `rss.xml`
     * 定义 `rss.xml` 中包含的博文个数
     */
    RSSCapacity: 16,

    /**
     * previewPort: Number
     * defined the port id for preview server
     * 为预览服务器定义端口
     */
    previewPort: 3000,

    /**
     * katexOptions: Object
     * options for katex.js rendering, see here: https://katex.org/docs/options
     * katex.js 用于渲染数学公式的配置项，见此：https://katex.org/docs/options
     */
    katexOptions: null
}
