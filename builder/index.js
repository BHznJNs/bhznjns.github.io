import fs from "node:fs"
import readDir, { Directory } from "./readDir.js"
import indexing from "./indexing.js"
import getNewest from "./getNewest.js"
import { rssFilePath } from "./path.js"
import { rssFileGenerator, rssItemGenerator, clearRssResources } from "./rss/index.js"

const staticDir = new Directory("static")
readDir(staticDir, "")
indexing(staticDir, "static")

// --- --- --- --- --- ---

clearRssResources()
const newests  = getNewest(staticDir)
const rssItems = newests.children.map(rssItemGenerator)
const rssContent = rssFileGenerator(rssItems)
fs.writeFileSync(rssFilePath, rssContent)
