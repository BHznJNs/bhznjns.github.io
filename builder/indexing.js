import { readFileSync, writeFileSync } from "node:fs"
import slice from "./utils/slice.js"
import { Directory, File } from "./utils/readDir.js"
import { indexFilePath } from "./utils/path.js"

export default function indexing(dir, indexName) {
    const currentDirItems = []
    let directoryDescription

    for (const item of dir.items) {
        if (item instanceof File) {
            if (item.name == "README.md") {
                directoryDescription = readFileSync(item.path, "utf-8")
                continue
            }
            currentDirItems.push(item.name)
        } else if (item instanceof Directory) {
            currentDirItems.push(item.name + "/")
            indexing(item, indexName + "+" + item.name)
        } else {
            // unreachable
        }
    }

    const sliced = slice(currentDirItems)
    const count  = sliced.length

    let index = 0
    for (const slice of sliced) {
        index += 1
        writeFileSync(`${indexFilePath}${indexName}_${index}`, JSON.stringify({
            total: count,
            current: index,
            content: slice,
            directoryDescription,
        }))
    }
}
