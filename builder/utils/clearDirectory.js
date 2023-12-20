import { accessSync, readdirSync, statSync, unlinkSync, constants } from "node:fs"

export default function(path) {
    try {
        accessSync(path, constants.R_OK | constants.W_OK)
    } catch(err) {
        console.error(`Path ${path} does node exist!`)
        return null
    }

    const dirContent = readdirSync(path)
    for (const file of dirContent) {
        const filePath = path + file
        const isFile = statSync(filePath).isFile()
        if (isFile) {
            unlinkSync(filePath)
        }
    }
}