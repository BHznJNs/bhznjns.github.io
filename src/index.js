import "./styles/style.css"

import "./scripts/mainManager.js"
import config from "../build.config.js"
import pageController from "./components/paging.js"
import keydownEvent from "./utils/dom/keydownEvent.js"
import { importComponent } from "./scripts/importer"

if (config.enableFab) {
    importComponent("fab")
}
if (config.enableCatalog) {
    importComponent("catalog")
}

const lightBtn = document.querySelector("#light-btn")
const darkBtn = document.querySelector("#dark-btn")
lightBtn.onkeydown = keydownEvent(lightBtn)
darkBtn.onkeydown = keydownEvent(darkBtn)

window.addEventListener("popstate", () => {
    if (location.hash.endsWith("/")) {
        // in a directory
        pageController.back()
    }
})
window.addEventListener("message", e => {
    if (e.origin != "null") {
        return
    }
    const { id, height } = e.data
    const targetIframeEl = document.getElementById(id)
    targetIframeEl.style.height = height + "px"
})

if ("serviceWorker" in navigator) {
    // if support service worker, register
    navigator.serviceWorker
        .register("./sw.js")
        .catch(function(error) {
            // registration failed
            console.error("Registration failed with " + error);
        })
}
