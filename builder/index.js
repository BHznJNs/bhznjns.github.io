import fs from "node:fs"
import readDir from "./readDir.js"
import indexing from "./indexing.js"
import getNewest from "./getNewest.js"
import { staticPath, rssFilePath } from "./path.js"
import { rssFileGenerator, rssItemGenerator, clearRssResources } from "./rss/index.js"

const filesData = readDir(staticPath)
indexing(filesData, "static")

// --- --- --- --- --- ---

clearRssResources()
const newest = getNewest(filesData, "static")
const rssItems = newest.children.map(item => rssItemGenerator(item))
const rssContent = rssFileGenerator(rssItems)
fs.writeFileSync(rssFilePath, rssContent)
