const fs = require("node:fs")

const staticPath = "./static/"
const indexPath  = "./.index/"

// returns:
// [ 'test.md', [ 'test_folder', [] ] ]
function readDir(path) {
    const result = []
    const dirContent = fs.readdirSync(path)

    // sort by time
    dirContent.sort((a, b) =>
        fs.statSync(path + b).mtime.getTime() - fs.statSync(path + a).mtime.getTime())

    for (const item of dirContent) {
        const currentPath = path + item
        const stat = fs.statSync(currentPath)
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

// [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
//                             ||
//                             ||
//                             \/
// [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]]
const pageCount = 10
function slicing(items) {
    if (items.length <= pageCount) {
        return [items]
    } else {
        const slices = []
        while (items.length > pageCount) {
            slices.push(items.splice(0, pageCount))
        }
        slices.push(items)
        return slices
    }
}

const filesData = readDir(staticPath)
function indexing(currentDir, currentName) {
    const currentDirFiles = []

    for (const item of currentDir) {
        if (typeof item == "string") {
            currentDirFiles.push(item)
        } else {
            currentDirFiles.push(item[0] + "/")
            indexing(item[1], `${currentName}+${item[0]}`)
        }
    }

    const sliced = slicing(currentDirFiles)
    const count = sliced.length
    let index = 0
    for (const slice of sliced) {
        index += 1
        fs.writeFileSync(`${indexPath}${currentName}_${index}`, JSON.stringify({
            total: count,
            current: index,
            content: slice,
        }))
    }
}

indexing(filesData, "static")
