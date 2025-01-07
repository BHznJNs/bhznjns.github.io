import fs from "node:fs"
import config from "../../../build.config.js"
import { robotsTxtPath, sitemapPath } from "../../utils/path.js"

const template = `\
User-agent: *
Allow: /
Sitemap: ${config.homepage}${sitemapPath}`

export default function() {
    if (fs.existsSync(robotsTxtPath)) {
        return
    }
    fs.writeFileSync(robotsTxtPath, template)
}
