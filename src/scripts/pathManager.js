import pageManager from "./pageManager.js"
import { fetchJSON, fetchMD } from "./fetchResources.js"
import articleRender from "./articleRenderer.js"
import indexRender, { newestItemRenderer, directoryItemRenderer } from "./indexRenderer.js"

export async function hashChangeEvent(_) {
    const mainEl = document.querySelector("main")
    const articleEl = document.querySelector("article")
    const indexDirPath = "./.index/"

    if (!location.hash) {
        pathManager.homepage()
        return
    }
    const hash = location.hash.slice(1)
    mainEl.classList.add("disabled")

    if (pathManager.isIn.newestPage()) {
        // open newest page
        const indexPath = indexDirPath + "newest_" + pageManager.current()
        const newestIndex = await fetchJSON(indexPath)
        if (!newestIndex) return
        indexRender(newestIndex, newestItemRenderer)
    } else
    if (pathManager.isIn.directory()) {
        // open directory
        const splited = hash.split("/").slice(0, -1)
        const indexFilePath = indexDirPath + splited.join("+") + "_" + pageManager.current()
        const index = await fetchJSON(indexFilePath)
        if (!index) return
        indexRender(index, directoryItemRenderer)
    } else
    if (pathManager.isIn.article()) {
        // open article
        const articleContent = await fetchMD("./" + hash)
        if (!articleContent) return
        mainEl.style.display = "none"
        articleRender(articleEl, articleContent)
    } else {
        pathManager.homepage()
    }

    mainEl.setAttribute("data-is-root", hash === "static/")
    mainEl.classList.remove("disabled")
}

window.addEventListener("hashchange", hashChangeEvent)
window.addEventListener("load", hashChangeEvent)

const homepagePath = "static/"
const newestPath = "newest/"
const pathManager = {
    homepage() {
        location.hash = homepagePath
    },

    open(name) {
        location.hash += name
    },
    jumpTo(target) {
        location.hash = target
    },
    parent() {
        if (location.hash === "#" + newestPath) {
            return homepagePath
        }
        const splited = location.hash.slice(1).split("/")
        if (this.isIn.directory()) {
            return splited.slice(0, -2).join("/") + "/"
        }
        if (this.isIn.article()) {
            return splited.slice(0, -1).join("/")
        }
        throw new Error("Unexpected hash: " + location.hash)
    },
    isIn: {
        newestPage() {
            return location.hash === "#newest/"
        },
        directory() {
            return location.hash.startsWith("#static")
                && location.hash.endsWith("/")
        },
        article() {
            return location.hash.startsWith("#static")
                && location.hash.endsWith(".md")
        }
    }
}
export default pathManager
