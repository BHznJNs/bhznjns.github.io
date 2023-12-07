import { readFileSync, writeFileSync } from "node:fs"
import config from "../../package.json" assert { type: 'json' }
import { rssResourcePath } from "../path.js"
import renderer from "../renderer.js"

function getFileParts(filePath) {
    const splited = filePath.split("/")
    const fileNameWithExt = splited.pop()
    const filename = fileNameWithExt.split(".").slice(0, -1).join(".")
    const parent = splited.join("/")
    return { filename, parent }
}

export class RssItem {
    title       = ""
    link        = ""
    description = ""

    constructor(title, link, description) {
        this.title       = title
        this.link        = link
        this.description = description
    }
    toString() {
        return `<item>
<title>${this.title}</title>
<link>${this.link}</link
description>${this.description}</description>
</item>`
    }
}

export default function rssItemGenerator(file) {
    const {filename, parent} = getFileParts(file.path)
    const fileContent = readFileSync(file.path, "utf-8")

    globalThis.__ResourcePath__ = config.homepage + parent
    const articleInfo = renderer(fileContent)
    globalThis.__ResourcePath__ = undefined

    const articlePath = rssResourcePath + filename + ".html"
    writeFileSync(articlePath, articleInfo.htmlContent)

    const rssItem = new RssItem(articleInfo.title, config.homepage + articlePath, articleInfo.description)
    return rssItem
}