import fs from "node:fs"
import path from "node:path"
import chokidar from "chokidar"
import { staticPath, indexFilePath } from "../utils/path.js"
import { readmeFilename, reverseFilename } from "../utils/filename.js"

function normalizePath(filePath) {
    return filePath.replace(/\\/g, "/")
}

function toIndexPath(filePath) {
    return filePath.replace(/\//g, "+")
}

/**
 * @param {string} filePath 
 * @param {"add" | "unlink" | "change"} type
 */
function resolveReadmeDesc(filePath, type) {
    const dirPath = path.dirname(path.resolve(filePath))
    const relativePath = path.relative("./", dirPath)
    const normalizedPath = normalizePath(relativePath)
    const targetIndexPath = indexFilePath + toIndexPath(normalizedPath) + "_1"

    if (!fs.existsSync(targetIndexPath)) {
        return
    }
    const indexContent = JSON.parse(fs.readFileSync(targetIndexPath, "utf8"))
    const readmeContent = fs.readFileSync(filePath, "utf8")
    switch (type) {
    case "add":
    case "change":
        indexContent.directoryDescription = readmeContent
        break
    case "unlink":
        delete indexContent.directoryDescription
        break
    }
    fs.writeFileSync(targetIndexPath, JSON.stringify(indexContent), "utf8")
}

function appendToIndex(filePath, isDir) {
    const itemName = path.basename(filePath) + (isDir ? "/" : "")
    const dirPath = path.dirname(path.resolve(filePath))
    const relativePath = path.relative("./", dirPath)
    const normalizedPath = normalizePath(relativePath)
    const targetIndexPath = indexFilePath + toIndexPath(normalizedPath) + "_1"

    if (reverseFilename.includes(itemName)) {
        return
    }
    if (!fs.existsSync(targetIndexPath)) {
        const indexContent = JSON.stringify({
            "total":1,"current":1,"content":[
            itemName
        ]})
        fs.writeFileSync(targetIndexPath, indexContent, "utf8")
        return
    }
    const isReversedDir = reverseFilename
        .map((name) => fs.existsSync(path.join(dirPath, name)))
        .includes(true)
    const indexContent = JSON.parse(fs.readFileSync(targetIndexPath, "utf8"))
    if (isReversedDir) {
        indexContent.content.push(itemName)
    } else {
        indexContent.content.unshift(itemName)
    }
    fs.writeFileSync(targetIndexPath, JSON.stringify(indexContent), "utf8")
}

function removeFromIndex(filePath, isDir) {
    const itemName = path.basename(filePath) + (isDir ? "/" : "")
    const dirPath = path.dirname(path.resolve(filePath))
    const relativePath = path.relative("./", dirPath)
    const normalizedPath = normalizePath(relativePath)
    const targetIndexPath = indexFilePath + toIndexPath(normalizedPath) + "_1"

    if (reverseFilename.includes(itemName)) {
        return
    }
    if (!fs.existsSync(targetIndexPath)) {
        return
    }
    const indexContent = JSON.parse(fs.readFileSync(targetIndexPath, "utf8"))
    const index = indexContent.content.indexOf(itemName)
    if (index === -1) {
        return
    }
    indexContent.content.splice(index, 1)
    if (indexContent.content.length === 0) {
        fs.unlinkSync(targetIndexPath)
    } else {
        fs.writeFileSync(targetIndexPath, JSON.stringify(indexContent), "utf8")
    }
}

function appendToNewest(filePath) {
    const filename = path.basename(filePath)
    const targetIndexPath = indexFilePath + "newest_1"
    if (!fs.existsSync(targetIndexPath)) {
        return
    }
    const indexContent = JSON.parse(fs.readFileSync(targetIndexPath, "utf8"))
    indexContent.content.unshift(filename)
    fs.writeFileSync(targetIndexPath, JSON.stringify(indexContent), "utf8")
}

function removeFromNewest(filePath) {
    const filename = path.basename(filePath)
    const targetIndexPath = indexFilePath + "newest_1"
    if (!fs.existsSync(targetIndexPath)) {
        return
    }
    const indexContent = JSON.parse(fs.readFileSync(targetIndexPath, "utf8"))
    const index = indexContent.content.indexOf(filename)
    if (index === -1) {
        return
    }
    indexContent.content.splice(index, 1)
    fs.writeFileSync(targetIndexPath, JSON.stringify(indexContent), "utf8")
}

function fileChanged(filePath) {
    if (readmeFilename.includes(path.basename(filePath))) {
        resolveReadmeDesc(filePath, "change")
        return
    }
}

(function entry() {
    if (!fs.existsSync(staticPath)) {
        return
    }
    const watcher = chokidar.watch(staticPath, {
        ignored: /^\./, // ignore hidden files & folders
        persistent: true,
        ignoreInitial: true,
        depth: Infinity,
    })
    console.log("Start watching static directory.")
    process.on("SIGINT", () => {
        console.log("Closing watcher...")
        watcher.close().then(() => {
            console.log("Watcher closed. Exiting process.")
            process.exit(0)
        })
    })
    watcher
        .on("add", (filePath) => {
            if (readmeFilename.includes(path.basename(filePath))) {
                resolveReadmeDesc(filePath, "add")
                return
            }
            appendToNewest(filePath)
            appendToIndex(filePath, false)
        })
        .on("unlink", (filePath) => {
            if (readmeFilename.includes(path.basename(filePath))) {
                resolveReadmeDesc(filePath, "unlink")
                return
            }
            removeFromNewest(filePath)
            removeFromIndex(filePath, false)
        })

        .on("addDir"   , (dirPath)  => appendToIndex(dirPath, true))
        .on("unlinkDir", (dirPath)  => removeFromIndex(dirPath, true))
        .on("change"   , (filePath) => fileChanged(filePath))
})()
