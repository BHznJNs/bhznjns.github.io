import fs from "node:fs"
import { sitemapTimeFormatter } from "./timeFormatter.js"
import config from "../../../build.config.js"
import { File } from "../../utils/directory.js"
import { sitemapPath } from "../../utils/path.js"

function template(lastUpdate, links) {
    return `\
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url>
<loc>${config.homepage}</loc>
<lastmod>${sitemapTimeFormatter(lastUpdate)}</lastmod>
</url>
${links}
</urlset>`
}

class SitemapItem {
    /**
     * @param {string} link 
     * @param {number} modifyTime A timestamp
     */
    constructor(link, modifyTime) {
        this.link = link
        this.modifyTime = sitemapTimeFormatter(modifyTime)
    }
    toString() {
        return `\
<url>
<loc>${this.link}</loc>
<lastmod>${this.modifyTime}</lastmod>
</url>`
    }
}

/**
 * @param {number} lastUpdate A timestamp
 * @param {File[]} articles 
 */
export default function(lastUpdate, articles) {
    const links = articles
        .slice(0, 1000)
        .map(file =>
            new SitemapItem(config.homepage + file.ssrPath, file.modifyTime))
        .map(item => item.toString())
        .join("")
    const fileContent = template(lastUpdate, links)
    fs.writeFileSync(sitemapPath, fileContent)
}
