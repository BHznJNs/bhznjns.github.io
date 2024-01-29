import { writeFileSync } from "node:fs"
import config from "../build.config.js"
import { rssFileGenerator, rssItemGenerator } from "./rss/index.js"
import { rssFilePath } from "./utils/path.js"
import isInIgnoredDir from "./utils/isInIgnoredDir.js"
import { execute } from "./utils/renderer/index.js"

export default function(newestItems) {
    const rssItemSize = config.RSSCapacity
    const rssIgnoredDirs = config.rssIgnoreDir
    const rssItems = newestItems
        .filter(item =>
            !isInIgnoredDir(item.path, rssIgnoredDirs)
        )
        .slice(0, rssItemSize)
        .map(rssItemGenerator)
    execute() // render images

    const rssContent = rssFileGenerator(rssItems)
    writeFileSync(rssFilePath, rssContent)
}