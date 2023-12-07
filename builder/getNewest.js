import { statSync } from "node:fs"

class FileItem {
    path = ""
    createTime = 0

    constructor(path) {
        this.path = path
        this.createTime = statSync(path).birthtime.getTime()
    }
}

const MAX_STACK_SIZE = 16
class FileMonoStack {
    // where the data are stored,
    // the biggest at the the leftest and
    // the smallest at the rightest.
    children = []
    constructor() {}

    #insert = (index, item) =>
        this.children.splice(index, 0, item)
    get length() {
        return this.children.length
    }

    push(fileItem) {
        if (this.length == 0) {
            this.children.push(fileItem)
            return
        }

        for (const index in this.children) {
            const item = this.children[index]

            // Since the `createTime` is a timestamp,
            // there is no need to consider the condition of
            // the two number equals.
            if (item.createTime < fileItem.createTime) {
                this.#insert(index, fileItem)
                return
            }
        }
        this.children.push(fileItem)
    }
    pop() {
        return this.children.shift()
    }
    concat(other) {
        while (other.length) {
            const item = other.children.pop()
            this.push(item)
        }
    }
}

export default function getNewest(currentDir, currentPath) {
    const fileStack = new FileMonoStack()

    for (const item of currentDir) {
        if (typeof item == "string") {
            // directly push filename
            fileStack.push(new FileItem(`${currentPath}/${item}`))
        } else {
            // recursively read folder
            const subFileStack = getNewest(item[1], `${currentPath}/${item[0]}`)
            fileStack.concat(subFileStack)
        }
    }

    if (fileStack.length > MAX_STACK_SIZE) {
        fileStack.children = fileStack.children.slice(0, MAX_STACK_SIZE)
    }
    return fileStack;
}
