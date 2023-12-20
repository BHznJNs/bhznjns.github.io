import { writeFileSync } from "node:fs"
import indexing from "./indexing.js"
import getNewest from "./getNewest.js"
import saveNewest from "./saveNewest.js"
import { indexFilePath, rssFilePath, rssResourcePath } from "./path.js"
import { rssFileGenerator, rssItemGenerator } from "./rss/index.js"
import clearDirectory from "./utils/clearDirectory.js"
import readDir, { Directory } from "./utils/readDir.js"

clearDirectory(indexFilePath)
clearDirectory(rssResourcePath)

const staticDir = new Directory("static")
readDir(staticDir, "")
indexing(staticDir, "static")

// --- --- --- --- --- ---

const newests = getNewest(staticDir)
saveNewest(newests.children)

const rssItemSize = 16
const rssItems = newests.children
    .slice(0, rssItemSize)
    .map(rssItemGenerator)
const rssContent = rssFileGenerator(rssItems)
writeFileSync(rssFilePath, rssContent)
