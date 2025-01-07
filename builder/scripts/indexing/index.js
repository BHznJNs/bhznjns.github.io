import saveNewest from "./saveNewest.js"
import saveSearchIndex from "./resolveSearch.js"
import getNewest from "../../getNewest.js"
import config from "../../../build.config.js"
import { traversal } from "../../utils/directory.js"
import { staticPath } from "../../utils/path.js"
import saveIndex from "./saveIndex.js"

const staticDir = traversal(staticPath)
await saveIndex(staticDir, false)

const newests = getNewest(staticDir)
if (config.enableNewest) {
    await saveNewest(newests.children)
}
if (config.enableSearch) {
    await saveSearchIndex(newests.children)
}
