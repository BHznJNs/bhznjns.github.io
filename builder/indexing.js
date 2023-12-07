import { writeFileSync } from "node:fs"
import slice from "./slice.js"
import { indexFilePath } from "./path.js"

export default function indexing(currentDir, currentName) {
    const currentDirFiles = []

    for (const item of currentDir) {
        if (typeof item == "string") {
            // directly push filename
            currentDirFiles.push(item)
        } else {
            // push folder name with '/' at end
            currentDirFiles.push(item[0] + "/")
            // recursively read folder
            indexing(item[1], `${currentName}+${item[0]}`)
        }
    }

    const sliced = slice(currentDirFiles)
    const count = sliced.length

    let index = 0
    for (const slice of sliced) {
        index += 1
        writeFileSync(`${indexFilePath}${currentName}_${index}`, JSON.stringify({
            total: count,
            current: index,
            content: slice,
        }))
    }
}