import { writeFileSync } from "node:fs"
import {
    header, navigator, footer,
    inlineDarkmodeSwitcherScript,
    htmlLang,
} from "../htmlPublicSnippets.js"
import { config } from "../utils/loadConfig.js"
import { indexHTMLPath } from "../utils/path.js"
import languageSelector from "../../src/utils/languageSelector.js"

const main = `\
<main data-is-root=true>
    <header id="directory-description"></header>
    <ul id="function-list">
${config.enableNewest ? `\
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
${config.enableCatalog
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
${config.extraScripts
    .map((scriptPath) =>
        `<script async src="${scriptPath}"></script>`)
    .join("")
}
</head>
<body>
<script src="./dist/index.min.js" type="module" defer></script>
${inlineDarkmodeSwitcherScript}
${config.enableSearch ? "<search-box></search-box>": ""}
${config.enableFab ? "<fab-icon></fab-icon>" : ""}
${navigator}
${main}
${article}
${footer}
</body>
</html>`
writeFileSync(indexHTMLPath, template)
