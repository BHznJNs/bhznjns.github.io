import { config } from "./utils/loadConfig.js"
import renderer from "../src/utils/markdown/index.js"
import languageSelector from "../src/utils/languageSelector.js"

export const htmlLang = languageSelector("zh-CN", "en")

export const header = (title, description) => `\
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="color-scheme" content="light dark">
<meta name="viewport" content="width=device-width, initial-scale=1.0">\
${description ? `\n<meta name="description" content="${description}">` : ""}
<title>${title}</title>
<link rel="shortcut icon" href="./dist/imgs/favicon.png" type="image/x-icon">
<link rel="stylesheet" href="./dist/style.min.css">`

export const inlineDarkmodeSwitcherScript = `\
<script>
const darkModeMediaQuery = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)")
const darkModeSwitcher = () => {
    const isDarkMode = darkModeMediaQuery.matches
    document.body.classList.toggle("dark" ,  isDarkMode)
    document.body.classList.toggle("light", !isDarkMode)
}
if (darkModeMediaQuery) {
    darkModeMediaQuery.addListener(darkModeSwitcher)
    darkModeSwitcher()
}
</script>`

export const navigator = `\
<nav>
    <a
        id="homepage"
        class="icon-btn underline-side left"
        href="./"
        onclick="globalThis.__CurrentPage__=1"
    >
        <img src="./dist/imgs/homepage.svg" alt="${languageSelector("主页", "home")}">
        <span class="underline-target">${languageSelector("主页", "Home")}</span>
    </a>
    <span>
${(config.search.enable) ? `\
        <button
            id="search-btn"
            class="icon-btn"
            title="${languageSelector("搜索", "Search")}"
        >
            <img
                src="./dist/imgs/search.svg"
                alt="${languageSelector("搜索", "Search")}"
            >
        </button>` : ""}
${(config.rss.enable) ? `\
        <a
            id="rss-icon"
            class="icon-btn"
            href="./rss.xml"
            title="${languageSelector("RSS 订阅", "RSS Subscribe")}"
        >
            <img
                src="./dist/imgs/rss.svg"
                alt="${languageSelector("RSS 订阅", "RSS Subscribe")}"
            >
        </a>` : ""}
        <span>
            <span
                id="light-btn"
                class="icon-btn"
                role="button"
                tabindex="0"
                title="${languageSelector("亮色模式", "Light Mode")}"
                onclick="document.body.classList.remove('dark'); document.body.classList.add('light')"
            >
                <img
                    src="./dist/imgs/sun.svg"
                    alt="${languageSelector("亮色模式图标", "Light Mode Icon")}"
                >
            </span>
            <span
                id="dark-btn"
                class="icon-btn"
                role="button"
                tabindex="0"
                title="${languageSelector("黑暗模式", "Dark Mode")}"
                onclick="document.body.classList.add('dark'); document.body.classList.remove('light')"
            >
                <img
                    src="./dist/imgs/moon.svg"
                    alt="${languageSelector("黑暗模式图标", "Dark Mode Icon")}"
                >
            </span>
        </span>
    </span>
</nav>`

export const footer = config.footer
    ? `<footer>${
        renderer(config.footer)
            .map(node => node.toHTML())
            .join("")
        }</footer>`
    : ""
