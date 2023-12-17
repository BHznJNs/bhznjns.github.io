import { accessSync, readdirSync, statSync, unlinkSync, constants } from "node:fs"
import { rssResourcePath } from "../path.js"

export function clearRssResources() {
    try {
        accessSync(rssResourcePath, constants.R_OK | constants.W_OK)
    } catch {
        return
    }

    const dirContent = readdirSync(rssResourcePath)
    for (const file of dirContent) {
        const filePath = rssResourcePath + file
        const isFile = statSync(filePath).isFile
        if (isFile) {
            unlinkSync(filePath)
        }
    }
}

export { default as rssItemGenerator, RssItem } from "./rssItemGenerator.js"
export { default as rssFileGenerator } from "./rssFileGenerator.js"
