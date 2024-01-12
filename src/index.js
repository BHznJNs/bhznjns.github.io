import "./styles/style.css"
import "./libs/katex/katex.css"

import "./scripts/mainManager.js"
import { hashChangeEvent } from "./scripts/pathManager.js"
import pageManager from "./scripts/pageManager.js"
import keydownEvent from "./utils/keydownEvent.js"

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
        hashChangeEvent()
    }
})
nextBtn.addEventListener("click", () => {
    pageManager.next()
    hashChangeEvent()
})
// -------------------------
// Buttons event setting end
// -------------------------

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
