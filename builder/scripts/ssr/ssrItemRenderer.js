import path from "node:path"
import {
    footer, header, htmlLang,
    inlineDarkmodeSwitcherScript,
    navigator,
} from "../../htmlPublicSnippets.js"
import { config } from "../../utils/loadConfig.js"
import renderer from "../../utils/markdown/index.js"
import languageSelector from "../../../src/utils/languageSelector.js"

function pageTemplate(title, body, origin) {
    return `\
<!DOCTYPE html>
<html lang="${htmlLang}">
<head>
${header(title)}
</head>
<body>
${inlineDarkmodeSwitcherScript()}
${navigator("../", false, true)}
<article>
${body}
<p><a href="${config.homepage + "#" + origin}">
    ${languageSelector("点此查看原文", "Click here to read original article")}
</a></p>
</article>
${footer()}
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
