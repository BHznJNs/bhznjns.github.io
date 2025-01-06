import fs from "node:fs"
import slice from "./slice.js"
import { indexFilePath } from "./path.js"
import { orderbyCreateTime, orderbyFilename, orderbyModifyTime, readmeFilename, reverseFilename } from "./filename.js"

const ORDERBY_CREATE_TIME = 0
const ORDERBY_MODIFY_TIME = 1
const ORDERBY_FILENAME = 2

export class Directory {
    name  = ""
    items = [] // [`Directory` | `File`]
    createTime = 0
    modifyTime = 0
    updateTime = 0

    constructor(name, createTime) {
        this.name = name
        this.createTime = createTime
        this.modifyTime = createTime
        this.updateTime = createTime
    }
    push(item) {
        this.items.push(item)
    }
    read(base="") {
        const dirPath = base + this.name
        const dirContent = fs.readdirSync(dirPath)
        let orderby = ORDERBY_CREATE_TIME
        let isReversed = false

        for (const item of dirContent) {
            const itemPath = dirPath + "/" + item
            const itemStat = fs.statSync(itemPath)
            const itemCreateTime = itemStat.birthtime.getTime()
            const itemModifyTime = itemStat.mtime.getTime()

            if (itemStat.isDirectory()) {
                if (item.startsWith(".")) {
                    // ignore directories whose name starts with '.'
                    continue
                }
                const subDir = new Directory(item, itemCreateTime)
                subDir.read(dirPath + "/")
                this.modifyTime = Math.max(this.modifyTime, subDir.modifyTime)
                this.updateTime = Math.max(this.updateTime, subDir.updateTime)
                this.push(subDir)
            } else {
                if (orderbyCreateTime.includes(item)) {
                    orderby = ORDERBY_CREATE_TIME; continue
                } else if (orderbyModifyTime.includes(item)) {
                    orderby = ORDERBY_MODIFY_TIME; continue
                } else if (orderbyFilename.includes(item)) {
                    orderby = ORDERBY_FILENAME; continue
                }
                if (reverseFilename.includes(item)) {
                    isReversed = true; continue
                }

                const file = new File(
                    item,
                    itemPath,
                    itemCreateTime,
                    itemModifyTime,
                )
                this.modifyTime = Math.max(this.modifyTime, itemModifyTime)
                this.updateTime = Math.max(this.updateTime, itemCreateTime)
                this.push(file)
            }
        }
        this.items.sort((a, b) => {
            // put directories at the front
            if (a instanceof Directory && b instanceof File) {
                return -1
            }
            if (b instanceof Directory && a instanceof File) {
                return 1
            }

            if (orderby === ORDERBY_CREATE_TIME) {
                // newer at the fronter position
                return b.createTime - a.createTime
            } else if (orderby === ORDERBY_MODIFY_TIME) {
                return b.modifyTime - a.modifyTime
            } else if (orderby === ORDERBY_FILENAME) {
                // a-z order
                return a.name.localeCompare(b.name)
            }
        })
        if (isReversed){
            this.items.reverse()
        }
    }
    indexing(indexName="static") {
        if (!fs.existsSync(indexFilePath)) {
            fs.mkdirSync(indexFilePath)
        }

        const currentFiles = []
        const currentDirs  = []
        let directoryDescription

        for (const item of this.items) {
            if (item instanceof File) {
                if (readmeFilename.includes(item.name)) {
                    directoryDescription = fs.readFileSync(item.path, "utf-8")
                    continue
                }
                currentFiles.push({
                    name: item.name,
                    modifyTime: item.modifyTime,
                })
            } else if (item instanceof Directory) {
                currentDirs.push({
                    name: item.name + "/",
                    modifyTime: item.modifyTime,
                })
                item.indexing(indexName + "+" + item.name)
            } else { /* unreachable */ }
        }

        const currentDirItems = currentDirs.concat(currentFiles)    
        const sliced = slice(currentDirItems)
        const count  = sliced.length

        let index = 0
        for (const slice of sliced) {
            index += 1
            const indexFileContent = {
                total: count,
                current: index,
                updateTime: this.updateTime,
                content: slice,
            }
            if (index === 1 && directoryDescription !== undefined) {
                // directory description only appear at page 1
                indexFileContent.directoryDescription = directoryDescription
            }
            fs.writeFileSync(
                `${indexFilePath}${indexName}_${index}`,
                JSON.stringify(indexFileContent)
            )
        }
    }

    static clear(path) {
        if (!fs.existsSync(path)) {
            return
        }
    
        const dirContent = fs.readdirSync(path)
        for (const file of dirContent) {
            const filePath = path + file
            const isFile = fs.statSync(filePath).isFile()
            if (isFile) {
                fs.unlinkSync(filePath)
            }
        }
    }
}

export class File {
    name = ""
    path = ""
    createTime = 0
    modifyTime = 0

    constructor(name, path, createTime, modifyTime) {
        this.name = name
        this.path = path
        this.createTime = createTime
        this.modifyTime = modifyTime
    }
}
