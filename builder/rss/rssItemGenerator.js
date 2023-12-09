import { readFileSync, writeFileSync } from "node:fs"
import config from "../../package.json" assert { type: 'json' }
import { rssResourcePath } from "../path.js"
import renderer from "../renderer.js"
import timeFormat from "../timeFormat.js"

function getPathParts(filePath) {
    const splited = filePath.split("/")
    const fileNameWithExt = splited.pop()
    const filename = fileNameWithExt.split(".").slice(0, -1).join(".")
    const parent = splited.join("/")
    return { filename, parent }
}

export class RssItem {
    title         = ""
    link          = ""
    pubTime       = null
    lastBuildTime = null
    description   = ""

    constructor(title, link, pubTime, lastBuildTime, description) {
        this.title         = title
        this.link          = link
        this.pubTime       = pubTime
        this.lastBuildTime = lastBuildTime
        this.description   = description
    }
    toString() {
        return `<item>
<title>${this.title}</title>
<link>${this.link}</link>
<pubDate>${timeFormat(this.pubTime)}</pubDate>
<lastBuildDate>${timeFormat(this.lastBuildTime)}</lastBuildDate>
<description>${this.description || " "}</description>
</item>
`
    }
}

export default function rssItemGenerator(file) {
    const { filename, parent } = getPathParts(file.path)
    const fileContent = readFileSync(file.path, "utf-8")

    globalThis.__ResourcePath__ = config.homepage + parent
    const articleInfo = renderer(fileContent)
    globalThis.__ResourcePath__ = undefined

    const articlePath = rssResourcePath + filename + ".html"
    writeFileSync(articlePath, articleInfo.htmlContent)

    const rssItem = new RssItem(
        articleInfo.title,
        config.homepage + articlePath,
        new Date(file.createTime),
        new Date(file.modifyTime),
        articleInfo.description
    )
    return rssItem
}