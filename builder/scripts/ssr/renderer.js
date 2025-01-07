import path from "node:path"
import config from "../../../build.config.js"
import renderer from "../../utils/markdown/index.js"
import languageSelector from "../../../src/utils/languageSelector.js"

const htmlLang = languageSelector("zh-CN", "en")
function pageTemplate(title, body, origin) {
    return `\
<!DOCTYPE html>
<html lang="${htmlLang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="../dist/style.min.css">
</head>
<body>
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
</script>
<article>
    ${body}
    <p><a href="${config.homepage + "#" + origin}">
        ${languageSelector("点此查看原文", "Click here to read original article")}
    </a></p>
</article>
</body>
</html>`
}

export function analyze(source) {
    const htmlNodes = renderer(source)
    htmlNodes.forEach(node => node.toHTML())
}

export function renderToHTML(articlePath, source) {
    const htmlNodes   = renderer(source)
    const title       = path.basename(articlePath, path.extname(articlePath))
    const htmlBody    = htmlNodes.map(node => node.toHTML()).join("")
    const htmlContent = pageTemplate(title, htmlBody, articlePath)
    return htmlContent
}
