import {
    header, navigator, footer,
    inlineDarkmodeSwitcherScript,
    htmlLang,
} from "./snippets.js"
import { config } from "../utils/loadConfig.js"
import { ssrListPath } from "../utils/path.js"
import languageSelector from "../../src/utils/languageSelector.js"
import el from "../../src/utils/dom/el.js"

const noscript = `\
<noscript>
<link rel="stylesheet" href="./dist/noscript.min.css">
<main id="noscript-main">
    <p>${languageSelector(
        `你的浏览器似乎禁用了 JavaScript，你可以点此<a href="${ssrListPath}">查看最新的文章</a>。`,
        `Your browser seems to have JavaScript disabled. You can click here to <a href="${ssrListPath}">view the latest articles</a>.`,
    )}</p>
</main>
</noscript>`

const main = `\
<main id="script-main" data-is-root=true>
    <header id="directory-description"></header>
    <ul id="function-list">
${config.newest.enable ? `\
        <li
            id="newest"
            tabindex="0"
            onclick="location.hash = 'newest/'"
        >${languageSelector("最新博文", "Newests")}</li>` : ""}
        <li
            id="previous-dir"
            tabindex="0"
        >../</li>
        <li id="update-time" tabindex="0">
            ${languageSelector("最后更新：", "Last updated: ")}<code></code>
        </li>
    </ul>
    <table id="newest-header">
        <thead><tr>
            <th>${languageSelector("名称", "Name")}</th>
            <th>${languageSelector("发布时间", "Publish Date")}</th>
        </tr></thead>
    </table>
    <table id="directory-header">
        <thead><tr>
            <th>${languageSelector("名称", "Name")}</th>
            <th>${languageSelector("上次修改", "Last Modified")}</th>
        </tr></thead>
    </table>
    <ul id="article-list"></ul>
    <paging-view></paging-view>
</main>`

const article = `\
<div id="article-container">
${config.catalog.enable
    ? "<article-catalog></article-catalog>"
    : ""
}
<article></article>
</div>`

const template = `\
<!DOCTYPE html>
<html lang="${htmlLang}">
<head>
${header(config.title ?? "MarkdownBlog", config.description)}
${config.extraMetadata
    .map(item => el("meta", item))
    .join("")
}
<script src="./dist/index.min.js" type="module" defer></script>
<link rel="preload" href=".index/static_1" as="fetch">
<link rel="preload" href=".index/newest_1" as="fetch">
</head>
<body>
${inlineDarkmodeSwitcherScript()}
${config.search.enable ? el("search-box"): ""}
${config.fab.enable    ? el("fab-icon")  : ""}
${navigator()}
${noscript}
${main}
${article}
${footer()}
${config.extraScripts
    .map((scriptPath) =>
        el("script", { async: true, src: scriptPath}))
    .join("")
}
</body>
</html>`

export default template
