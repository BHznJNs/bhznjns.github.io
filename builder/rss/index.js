import fs from "node:fs"
import { rssResourcePath } from "../path.js"

export function clearRssResources() {
    if (!fs.accessSync(rssResourcePath, fs.constants.R_OK | fs.constants.W_OK)) {
        return
    }
    const dirContent = fs.readdirSync(rssResourcePath)
    for (const file of dirContent) {
        const filePath = rssResourcePath + file
        const isFile = fs.statSync(filePath).isFile
        if (isFile) {
            fs.unlinkSync(filePath)
        }
    }
}

export { default as rssItemGenerator, RssItem } from "./rssItemGenerator.js"
export { default as rssFileGenerator } from "./rssFileGenerator.js"
