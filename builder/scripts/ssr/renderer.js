import path from "node:path"
import config from "../../../build.config.js"
import renderer from "../../utils/markdown/index.js"
import languageSelector from "../../../src/utils/languageSelector.js"
import { footer, inlineDarkmodeSwitcherScript } from "../../htmlPublicSnippets.js"

function pageTemplate(title, body, origin) {
    return `\
<!DOCTYPE html>
<html lang="${languageSelector("zh-CN", "en")}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="../dist/style.min.css">
</head>
<body>
${inlineDarkmodeSwitcherScript}
<article>
${body}
<p><a href="${config.homepage + "#" + origin}">
    ${languageSelector("点此查看原文", "Click here to read original article")}
</a></p>
</article>
${footer}
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
