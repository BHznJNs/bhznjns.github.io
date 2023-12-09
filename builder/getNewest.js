import { Directory, File } from "./readDir.js"

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

    push(file) {
        if (this.length == 0) {
            this.children.push(file)
            return
        }

        for (const index in this.children) {
            const item = this.children[index]

            // Since the `createTime` is a timestamp,
            // there is no need to consider the condition of
            // the two number equals.
            if (item.createTime < file.createTime) {
                this.#insert(index, file)
                return
            }
        }
        this.children.push(file)
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

export default function getNewest(dir) {
    const fileStack = new FileMonoStack()

    for (const item of dir.items) {
        if (item instanceof File) {
            fileStack.push(item)
        } else if (item instanceof Directory) {
            // recursively read folder
            const subFileStack = getNewest(item)
            fileStack.concat(subFileStack)
        }
    }

    if (fileStack.length > MAX_STACK_SIZE) {
        fileStack.children = fileStack.children.slice(0, MAX_STACK_SIZE)
    }
    return fileStack;
}
