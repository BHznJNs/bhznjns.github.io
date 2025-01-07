import { readFileSync } from "node:fs"
import { utimesSync } from "utimes"
import { backupFilePath } from "../utils/path.js"

const backupData = JSON.parse(readFileSync(backupFilePath, "utf-8"))

function restoreDir(dir, path) {
    const dirPath = path + dir.name + "/"

    // restore current directory
    utimesSync(dirPath, {
        btime: dir.createTime,
        mtime: dir.modifyTime,
    })

    for (const item of dir.items) {
        const isDir = "items" in item
        if (isDir) {
            // restore sub directory
            restoreDir(item, dirPath)
        } else {
            // restore sub file
            utimesSync(item.path, {
                btime: item.createTime,
                mtime: item.modifyTime,
            })
        }
    }
}
restoreDir(backupData, "./")
