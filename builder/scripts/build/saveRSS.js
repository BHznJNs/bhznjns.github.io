import fs from "node:fs"
import { rssFileGenerator, rssItemGenerator } from "../../rss/index.js"
import config from "../../../build.config.js"
import { staticPath, rssFilePath, rssResourcePath } from "../../utils/path.js"
import { execute } from "../../utils/renderer/index.js"

function isInIgnoredDir(path, ignoredDirs) {
    if (!ignoredDirs) {
        return false
    }

    for (const dirName of ignoredDirs) {
        if (path.startsWith(staticPath + dirName)) {
            return true
        }
    }
    return false
}


export default function(newestItems) {
    if (!fs.existsSync(rssResourcePath)) {
        fs.mkdirSync(rssResourcePath)
    }

    const rssItemSize = config.RSSCapacity
    const rssIgnoredDirs = config.RSSIgnoredDir
    const rssItems = newestItems
        .filter(item =>
            !isInIgnoredDir(item.path, rssIgnoredDirs)
        )
        .slice(0, rssItemSize)
        .map(rssItemGenerator)
    execute() // render images

    const rssContent = rssFileGenerator(rssItems)
    fs.writeFileSync(rssFilePath, rssContent)
}