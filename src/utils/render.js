import keydownEvent from "./keydownEvent.js"
import { importHighlighter, importTexRenderer } from "./importer.js"
import el from "./markdown/utils/el.js"

const articleEl    = document.querySelector("article")
const mainEl       = document.querySelector("main")
const parentDirBtn = mainEl.querySelector("#previous-dir li")
const articleList  = mainEl.querySelector("#article-list")

// ----------------
// article renderer
// ----------------

articleEl.addEventListener("click", (e) => {
    const target = e.target
    if (target.tagName == "IMG") {
        window.open(target.src)
    }
})

export function mdRender(structure) {
    // language names to import
    globalThis.__LanguageList__ = new Set()
    // to deside whether to import `katex`
    globalThis.__ContainsFormula__ = false

    let resultHTML = structure
        .map(node => node.toHTML())
    if (!resultHTML.length) {
        resultHTML = el("h1", "404 Not Found")
    }
    articleEl.innerHTML = ""
    resultHTML.forEach(el => articleEl.appendChild(el))

    mainEl.style.display = "none"
    articleEl.style.display = "block"
    articleEl.querySelectorAll("[tabindex='0']").forEach((el) => {
        el.onkeydown = keydownEvent(el)
    })
    // return to the top
    document.body.scrollTop = 0
    document.documentElement.scrollTop = 0

    importHighlighter().then(() => globalThis.__LanguageList__ = null)
    importTexRenderer().then(() => globalThis.__ContainsFormula__ = false)
}

// --------------
// index renderer
// --------------

parentDirBtn.addEventListener("click", () => {
    const splited = location.hash.split("/")
    globalThis.__CurrentPage__ = 1
    location.hash = splited.slice(0, -2).join("/") + "/"
})
articleList.addEventListener("click", (e) => {
    const target = e.target

    if (!target.getAttribute("data-target-blog")) {
        if (target.innerText.endsWith("/")) {
            globalThis.__CurrentPage__ = 1
        }
        location.hash += target.innerText
    } else {
        globalThis.__CurrentPage__ = 1
        location.hash = target.getAttribute("data-target-blog")
    }
})

export function indexRender(indexing, itemResolver) {
    // calculate properties
    const {current, total} = indexing
    let isFirstPage = false
    let isLastPage = false
    let isOnlyPage = false
    if (total == 1) {
        isOnlyPage = true
    } else {
        if (current == 1) {
            isFirstPage = true
        }
        if (current == total) {
            isLastPage = true
        }
    }
    mainEl.setAttribute("data-is-first-page", isFirstPage)
    mainEl.setAttribute("data-is-last-page", isLastPage)
    mainEl.setAttribute("data-is-only-page", isOnlyPage)


    // --- --- --- --- --- ---

    // reset HTML content
    articleList.innerHTML = ""
    indexing.content
        .map(itemResolver)
        .forEach(el =>
            articleList.appendChild(el)
        )

    // set keyboard event
    articleList.querySelectorAll("[tabindex='0']").forEach((el) => {
        el.onkeydown = keydownEvent(el)
    })

    // --- --- --- --- --- ---

    articleEl.style.display = "none"
    mainEl.style.display = "block"
}