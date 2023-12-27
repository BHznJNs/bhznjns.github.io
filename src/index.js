import "./styles/style.css"
import "./libs/katex/katex.css"

import { fetchJSON, fetchMD } from "./utils/fetchResources.js"
import keydownEvent from "./utils/keydownEvent.js"
import mdResolver from "./utils/markdown/index.js"
import el from "./utils/markdown/utils/el.js"
import { mdRender, indexRender } from "./utils/render.js"

globalThis.__CurrentPage__ = 1
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
    if (globalThis.__CurrentPage__ > 0) {
        globalThis.__CurrentPage__ -= 1
        hashEvent()
    }
})
nextBtn.addEventListener("click", () => {
    globalThis.__CurrentPage__ += 1
    hashEvent()
})

// -------------------------
// Buttons event setting end
// -------------------------


// ---------------------
// Hash controller start
// ---------------------

const mainEl = document.querySelector("main")
const articleList = document.getElementById("article-list")

async function hashEvent() {
    if (!location.hash) {
        location.hash = "static/"
        return
    }

    const hash = location.hash.slice(1) // remove '#'
    articleList.classList.add("disabled")

    if (hash == "newest/") {
        // open newest page
        const newestIndex = await fetchJSON(indexDirPath + "newest_" + globalThis.__CurrentPage__)
        indexRender(newestIndex, item => {
            const dateEl  = el("code", item.date)
            const titleEl = el("span", item.title)
            return el("li",
                [dateEl, el("text", ": "), titleEl],
                {
                    tabindex: 0,
                    "data-target-blog": item.link
                }
            )
        })
    } else
    if (hash.startsWith("static") && hash.endsWith("/")) {
        // open folder
        const splited = hash.split("/").slice(0, -1)
        const indexFilePath = indexDirPath + splited.join("+") + "_" + globalThis.__CurrentPage__
        const index = await fetchJSON(indexFilePath)
        indexRender(index, item =>
            el("li", el("span", item), {
                tabindex: 0
            })
        )
    } else
    if (hash.startsWith("static") && hash.endsWith(".md")) {
        // open article
        const articleContent = await fetchMD("./" + hash)
        const structure = mdResolver(articleContent)
        mdRender(structure)
    } else {
        location.hash = "static/"
        return
    }

    // delay this operation
    mainEl.setAttribute("data-is-root", hash == "static/")
    articleList.classList.remove("disabled")
}

window.onload = hashEvent
window.addEventListener("hashchange", hashEvent)
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