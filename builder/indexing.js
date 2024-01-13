import { readFileSync, writeFileSync } from "node:fs"
import slice from "./utils/slice.js"
import { Directory, File } from "./utils/readDir.js"
import { indexFilePath } from "./utils/path.js"

export default function indexing(dir, indexName) {
    const currentFiles = []
    const currentDirs  = []
    let directoryDescription
    let isInversed = false

    for (const item of dir.items) {
        if (item instanceof File) {
            if (item.name === "README.md" || item.name === "读我.md") {
                directoryDescription = readFileSync(item.path, "utf-8")
                continue
            }
            if (item.name === "rev" || item.name === "倒序") {
                isInversed = true
                continue
            }
            currentFiles.push(item.name)
        } else if (item instanceof Directory) {
            currentDirs.push(item.name + "/")
            indexing(item, indexName + "+" + item.name)
        } else { /* unreachable */ }
    }

    if (isInversed) {
        currentFiles.reverse()
        currentDirs.reverse()
    }
    const currentDirItems = currentDirs.concat(currentFiles)

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
