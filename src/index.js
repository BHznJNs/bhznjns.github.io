import { fetchJSON, fetchMD } from "./utils/fetch.js"
import mdResolver from "./utils/markdown/index.js"
import { mdRender, indexRender } from "./utils/render.js"

globalThis.CurrentPage = 1
const indexDirPath = "./index/"

document.querySelector("button#previous").addEventListener("click", () => {
    if (globalThis.CurrentPage > 0) {
        globalThis.CurrentPage -= 1
        hashEvent()
    }
})
document.querySelector("button#next").addEventListener("click", () => {
    globalThis.CurrentPage += 1
    hashEvent()
})

// ---------------------
// hash controller start
// ---------------------
const mainEl = document.querySelector("main")

async function hashEvent() {
    if (location.hash) {
        const hash = location.hash.slice(1)
        mainEl.setAttribute("data-is-root", hash == "static/")

        if (hash.endsWith("/")) {
            const splited = hash.split("/").slice(0, -1)
            const indexFilePath = indexDirPath + splited.join("+") + "_" + globalThis.CurrentPage
            const indexing = await fetchJSON(indexFilePath)
            indexRender(indexing)
        }
        if (hash.endsWith(".md")) {
            const articleContent = await fetchMD("./" + hash)
            const structure = mdResolver(articleContent)
            mdRender(structure)
        }
    } else {
        location.hash = "static/"
    }
}

window.onload = hashEvent
window.addEventListener("hashchange", hashEvent)
// -------------------
// hash controller end
// -------------------