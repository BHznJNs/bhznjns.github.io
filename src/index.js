import "./styles/style.css"
import "./libs/katex/katex.css"

import pageManager from "./scripts/pageManager.js"
import { fetchJSON, fetchMD } from "./scripts/fetchResources.js"
import keydownEvent from "./scripts/keydownEvent.js"
import { articleRender, directoryItemRenderer, indexRender, newestItemRenderer } from "./utils/render.js"

const indexDirPath = "./.index/"

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
    if (pageManager.current() > 0) {
        pageManager.previous()
        hashEvent()
    }
})
nextBtn.addEventListener("click", () => {
    pageManager.next()
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
    if (!location.hash) {
        location.hash = "static/"
        return
    }

    const hash = location.hash.slice(1) // remove '#'
    mainEl.classList.add("disabled")

    if (hash == "newest/") {
        // open newest page
        const indexPath = indexDirPath + "newest_" + pageManager.current()
        const newestIndex = await fetchJSON(indexPath)
        if (!newestIndex) return
        indexRender(newestIndex, newestItemRenderer)
    } else
    if (hash.startsWith("static") && hash.endsWith("/")) {
        // open directory
        const splited = hash.split("/").slice(0, -1)
        const indexFilePath = indexDirPath + splited.join("+") + "_" + pageManager.current()
        const index = await fetchJSON(indexFilePath)
        if (!index) return
        indexRender(index, directoryItemRenderer)
    } else
    if (hash.startsWith("static") && hash.endsWith(".md")) {
        // open article
        const articleContent = await fetchMD("./" + hash)
        if (!articleContent) return
        articleRender(articleContent)
    } else {
        // the hash "#static/" is the homepage
        location.hash = "static/"
        return
    }

    // delay this operation
    mainEl.setAttribute("data-is-root", hash == "static/")
    mainEl.classList.remove("disabled")
}

window.addEventListener("load", hashEvent)
window.addEventListener("hashchange", hashEvent)
window.addEventListener("popstate", () => {
    if (location.hash.endsWith("/")) {
        // in a directory
        pageManager.back()
    }
})
window.addEventListener("message", (e) => {
    if (e.origin != "null") {
        return
    }
    const { id, height } = e.data
    const targetIframeEl = document.getElementById(id)
    targetIframeEl.style.height = height + "px"
}, false)

// -------------------
// Hash controller end
// -------------------