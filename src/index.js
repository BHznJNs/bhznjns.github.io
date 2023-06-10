import { fetchJSON, fetchMD } from "./utils/fetch.js"
import keydownEvent from "./utils/keydownEvent.js"
import mdResolver from "./utils/markdown/index.js"
import { mdRender, indexRender } from "./utils/render.js"

globalThis.CurrentPage = 1
const indexDirPath = "./index/"

// ---------------------------
// Buttons event setting start
// ---------------------------

const lightBtn = document.querySelector("#light-btn")
const darkBtn = document.querySelector("#dark-btn")
const previousBtn = document.querySelector("button#previous")
const nextBtn = document.querySelector("button#next")

lightBtn.onkeydown = keydownEvent(lightBtn)
darkBtn.onkeydown = keydownEvent(darkBtn)
previousBtn.addEventListener("click", () => {
    if (globalThis.CurrentPage > 0) {
        globalThis.CurrentPage -= 1
        hashEvent()
    }
})
nextBtn.addEventListener("click", () => {
    globalThis.CurrentPage += 1
    hashEvent()
})

// -------------------------
// Buttons event setting end
// -------------------------


// ---------------------
// Hash controller start
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
// Hash controller end
// -------------------