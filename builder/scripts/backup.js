import { writeFileSync } from "node:fs"
import { traversal } from "../utils/directory.js"
import { backupFilePath, staticPath } from "../utils/path.js"

const staticDir = traversal(staticPath)
const backupData = JSON.stringify(staticDir)
writeFileSync(backupFilePath, backupData)
