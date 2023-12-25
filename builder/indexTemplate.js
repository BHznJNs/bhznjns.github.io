import { writeFileSync } from "node:fs"
import config from "../build.config.js"
import { indexHTMLPath } from "./utils/path.js"
import el from "../src/utils/markdown/utils/el.js"

const currentLang = config.language
const langList = [
    "zh",
    "en",
]
function languageSelectorCreator(lang) {
    for (const [index, langName] of Object.entries(langList)) {
        if (currentLang == langName) {
            return (...selections) => selections[index]
        }
    }
    console.warn("Unexpected language: " + lang)
    // default returns English text
    return (...selections) => selections[1]
}
const languageSelect = languageSelectorCreator(currentLang)

// --- --- --- --- --- ---

const HTMLHeader = `\
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="color-scheme" content="light dark">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BHznJNs' Blog</title>
    <link rel="shortcut icon" href="./src/imgs/favicon.png" type="image/x-icon">
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
        <img src="./src/imgs/homepage.svg" alt="${languageSelect("主页", "home")}">
        <span>${languageSelect("主页", "Home")}</span>
    </a>
    <span>
${(config.enableRSS && config.enableRSS.value) ? `\
        <a
            id="rss-icon"
            class="icon-btn"
            href="./rss.xml"
            title="${languageSelect("RSS 订阅", "RSS Subscribe")}"
        >
            <img
                src="./src/imgs/rss.svg"
                alt="${languageSelect("RSS 订阅", "RSS Subscribe")}"
            >
        </a>` : ""}
        <span>
            <span
                id="light-btn"
                class="icon-btn"
                role="button"
                tabindex="0"
                title="${languageSelect("亮色模式", "Light Mode")}"
                onclick="document.body.classList.remove('dark')"
            >
                <img
                    src="./src/imgs/sun.svg"
                    alt="${languageSelect("亮色模式图标", "Light Mode Icon")}"
                >
            </span>
            <span
                id="dark-btn"
                class="icon-btn"
                role="button"
                tabindex="0"
                title="${languageSelect("黑暗模式", "Dark Mode")}"
                onclick="document.body.classList.add('dark')"
            >
                <img
                    src="./src/imgs/moon.svg"
                    alt="${languageSelect("黑暗模式图标", "Dark Mode Icon")}"
                >
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
                ${languageSelect("最新博文", "Newests")}
            </li>
        </ul>` : ""}
    </div>

    <ul id="previous-dir"><li tabindex="0">../</li></ul>
    <ul id="article-list"></ul>
    <div id="page-switchers">
        <button id="previous" class="icon-btn">
            <span>${languageSelect("上一页", "Previous")}</span>
        </button>
        <button id="next" class="icon-btn">
            <span>${languageSelect("下一页", "Next")}</span>
        </button>
    </div>
</main>`

const footer = config.footer
    ? el("footer", config.footer)
    : ""

// --- --- --- --- --- ---

const template = `\
<!DOCTYPE html>
<html>
${HTMLHeader}
<body>
${inlineDarkmodeSwitcherScript}
${navigator}
${main}
<article style="display: none;"></article>
${footer}
</body>
</html>`

export default () => writeFileSync(indexHTMLPath, template)
