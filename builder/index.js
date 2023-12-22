import { writeFileSync } from "node:fs"
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

clearDirectory(indexFilePath)
clearDirectory(rssResourcePath)
writeIndexTemplate()

const staticDir = new Directory("static")
readDir(staticDir, "")
indexing(staticDir, "static")

// --- --- --- --- --- ---

const newests = getNewest(staticDir)
saveNewest(newests.children)

const rssItemSize = 16
const rssIgnoredDirs = config.enableRSS.ignoreDir
const rssItems = newests.children
    .filter(item =>
        !isInIgnoredDir(item.path, rssIgnoredDirs)
    )
    .slice(0, rssItemSize)
    .map(rssItemGenerator)
const rssContent = rssFileGenerator(rssItems)
writeFileSync(rssFilePath, rssContent)
