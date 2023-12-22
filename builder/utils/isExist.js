import { accessSync, constants } from "node:fs"

export default function(path) {
    try {
        accessSync(path, constants.R_OK | constants.W_OK)
        return true
    } catch(err) {
        console.error(`Path ${path} does node exist!`)
        return false
    }
}
