import { writeFileSync, unlinkSync } from "node:fs"
import indexing from "./indexing.js"
import getNewest from "./getNewest.js"
import saveNewest from "./saveNewest.js"
import config from "../build.config.js"
import { rssFileGenerator, rssItemGenerator } from "./rss/index.js"
import { indexFilePath, rssFilePath, rssResourcePath } from "./utils/path.js"
import clearDirectory from "./utils/clearDirectory.js"
import writeIndexTemplate from "./indexTemplate.js"
import readDir, { Directory } from "./utils/readDir.js"
import isInIgnoredDir from "./utils/isInIgnoredDir.js"

try { unlinkSync(rssFilePath) } catch {}
clearDirectory(indexFilePath)
clearDirectory(rssResourcePath)
writeIndexTemplate()

const staticDir = new Directory("static")
readDir(staticDir, "")
indexing(staticDir, "static")

// --- --- --- --- --- ---

if (!config.enableRSS && !config.enableNewest) {
    // if RSS and newest are both disabled,
    // there is no need to continue.
    process.exit(0)
}

const newests = getNewest(staticDir)
if (config.enableNewest && config.enableNewest.value) {
    saveNewest(newests.children)
}

if (config.enableRSS && config.enableRSS.value) {
    const rssItemSize = config.RSSCapacity
    const rssIgnoredDirs = config.enableRSS.ignoreDir
    const rssItems = newests.children
        .filter(item =>
            !isInIgnoredDir(item.path, rssIgnoredDirs)
        )
        .slice(0, rssItemSize)
        .map(rssItemGenerator)
    const rssContent = rssFileGenerator(rssItems)
    writeFileSync(rssFilePath, rssContent)
}
