import { readdirSync, statSync } from "node:fs"

// input: directory path
// returns:
// [ 'test.md', [ 'test_folder', [] ] ]
export default function readDir(path) {
    const result = []
    const dirContent = readdirSync(path)

    // sort by time
    dirContent.sort((a, b) =>
        statSync(path + b).birthtime.getTime() - statSync(path + a).birthtime.getTime())

    for (const item of dirContent) {
        const currentPath = path + item
        const stat = statSync(currentPath)
        if (stat.isDirectory()) {
            if (!item.startsWith(".")) {
                result.push([item, readDir(currentPath + "/")])
            }
        } else {
            result.push(item)
        }
    }
    return result
}