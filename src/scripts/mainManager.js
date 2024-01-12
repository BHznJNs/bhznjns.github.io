import { hashChangeEvent } from "./pathManager.js"
import pageManager from "./pageManager.js"
import pathManager from "./pathManager.js"

const previousBtn = document.querySelector("button#previous")
const nextBtn     = document.querySelector("button#next")
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

// --- --- --- --- --- ---

const mainEl           = document.querySelector("main")
const parentDirBtn     = mainEl.querySelector("#previous-dir li")
const articleList      = mainEl.querySelector("#article-list")
parentDirBtn.addEventListener("click", () => {
    pageManager.back()
    pathManager.jumpTo(pathManager.parent())
})
articleList.addEventListener("click", (e) => {
    const target = e.target

    if (target == articleList) {
        // when click on the `articleList` itself
        // ignore this event.
        return
    }

    if (!target.getAttribute("data-target-blog")) {
        if (target.innerText.endsWith("/")) {
            // open directory
            pageManager.open()
        }
        pathManager.open(target.innerText)
    } else {
        // in `newest` page
        pageManager.open()
        pathManager.jumpTo(target.getAttribute("data-target-blog"))
    }
})
