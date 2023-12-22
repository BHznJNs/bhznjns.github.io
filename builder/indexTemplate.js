import { writeFileSync } from "node:fs"
import config from "../build.config.js"
import { indexHTMLPath } from "./utils/path.js"

const HTMLHeader = `\
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="color-scheme" content="light dark">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BHznJNs' Blog</title>
    <link rel="shortcut icon" href="./src/assets/favicon.png" type="image/x-icon">
    <link rel="stylesheet" href="./dist/style.min.css">
    <script src="./dist/index.min.js" type="module" defer></script>
</head>`

const inlineDarkmodeSwitcherScript = `\
<script>
    const darkModeMediaQuery = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)")
    const darkModeSwitcher = () => {
        const isDarkMode = darkModeMediaQuery.matches
        document.body.classList.toggle("dark", isDarkMode)
    }
    darkModeMediaQuery.addListener(darkModeSwitcher)
    darkModeSwitcher()
</script>`

const navigator = `\
<nav>
    <a id="homepage" class="icon-btn" href="#">
        <img src="./src/assets/homepage.svg" alt="主页">
        <span>主页</span>
    </a>

    <span>
${(config.enableRSS && config.enableRSS.value) ? `\
        <a
            id="rss-icon"
            class="icon-btn"
            href="./rss.xml"
            title="RSS 订阅"
        >
            <img src="./src/assets/rss.svg" alt="RSS 订阅">
        </a>` : ""}
        <span>
            <span
                id="light-btn"
                class="icon-btn"
                role="button"
                tabindex="0"
                title="亮色模式"
                onclick="document.body.classList.remove('dark')"
            >
                <img src="./src/assets/sun.svg" alt="亮色模式">
            </span>
            <span
                id="dark-btn"
                class="icon-btn"
                role="button"
                tabindex="0"
                title="黑暗模式"
                onclick="document.body.classList.add('dark')"
            >
                <img src="./src/assets/moon.svg" alt="黑暗模式">
            </span>
        </span>
    </span>
</nav>`

const main = `\
<main
    style="display: none;"
    data-is-root=true
    data-is-first-page=""
    data-is-last-page=""
    data-is-only-page=""
>
    <div id="homepage-description">
        ${config.siteDescription ? config.siteDescription : ""}
${config.enableNewest ? `\
        <ul>
            <li
                tabindex="0"
                onclick="location.hash = 'newest/'"
            >
                最新博文
            </li>
        </ul>` : ""}
    </div>

    <ul id="previous-dir"><li tabindex="0">../</li></ul>
    <ul id="article-list"></ul>
    <div id="page-switchers">
        <button id="previous" class="icon-btn"><span>上一页</span></button>
        <button id="next" class="icon-btn"><span>下一页</span></button>
    </div>
</main>`

const template = `\
<!DOCTYPE html>
<html>
${HTMLHeader}
<body>
${inlineDarkmodeSwitcherScript}
${navigator}
${main}
<article style="display: none;"></article>
</body>
</html>`

export default function writeTemplate() {
    writeFileSync(indexHTMLPath, template)
}
