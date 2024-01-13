import "./styles/style.css"
import "./libs/katex/katex.css"

import "./scripts/mainManager.js"
import pageManager from "./scripts/pageManager.js"
import keydownEvent from "./utils/keydownEvent.js"

const lightBtn = document.querySelector("#light-btn")
const darkBtn = document.querySelector("#dark-btn")
lightBtn.onkeydown = keydownEvent(lightBtn)
darkBtn.onkeydown = keydownEvent(darkBtn)

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
