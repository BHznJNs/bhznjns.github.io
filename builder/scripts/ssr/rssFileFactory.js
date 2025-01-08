import { escapeRSSXML } from "./escapeResolver.js"
import { rssTimeFormatter } from "./timeFormatter.js"
import { config } from "../../utils/loadConfig.js"
import { File } from "../../utils/directory.js"

export class RSSItem {
    title         = ""
    link          = ""
    pubTime       = null
    lastBuildTime = null

    toString() {
        return `<item>
<title>${this.title}</title>
<link>${this.link}</link>
<pubDate>${rssTimeFormatter(this.pubTime)}</pubDate>
<lastBuildDate>${rssTimeFormatter(this.lastBuildTime)}</lastBuildDate>
</item>`
    }

    /**
     * @param {File} file
     * @returns {RSSItem}
     */
    static from(file) {
        const rssItem = new RSSItem()
        rssItem.title         = escapeRSSXML(file.nameWithoutExt)
        rssItem.link          = escapeRSSXML(config.homepage + file.ssrPath)
        rssItem.pubTime       = file.createTime
        rssItem.lastBuildTime = file.modifyTime
        return rssItem
    }
}

/**
 * @param {RSSItem[]} items 
 * @returns {string} RSS XML string
 */
export default function(items) {
    const RssTemplateBefore = `\
<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
<title>${config.title ? config.title : "Markdown Blog"}</title>
<link>${config.homepage ? config.homepage : "https://bhznjns.github.io/markdown-blog-template"}</link>\
${config.description ? `\n<description>${escapeRSSXML(config.description)}</description>` : ""}\
${config.rss.extraMetadata ? config.rss.extraMetadata : ""}`
    const RssTemplateAfter = "</channel></rss>"

    const itemsString = items.map(item => item.toString()).join("");
    return RssTemplateBefore + itemsString + RssTemplateAfter
}
