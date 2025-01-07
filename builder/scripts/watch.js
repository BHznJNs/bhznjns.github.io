import fs from "node:fs"
import path from "node:path"
import chokidar from "chokidar"
import saveIndex from "./indexing/saveIndex.js"
import { staticPath } from "../utils/path.js"
import { readmeFilename } from "../utils/filename.js"
import debounce from "../../src/utils/debounce.js"

async function update() {
    const staticDir = traversal(staticPath)
    await saveIndex(staticDir)

    const newests = getNewest(staticDir)
    if (config.enableNewest) {
        await saveNewest(newests.children)
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
        .on("add"      , update)
        .on("unlink"   , update)
        .on("addDir"   , update)
        .on("unlinkDir", update)
        .on("change"   , (filePath) => {
            if (readmeFilename.includes(path.basename(filePath))) {
                debounce(() => update(), 100)
            }
        })
})()
