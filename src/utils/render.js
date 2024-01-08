import keydownEvent from "../scripts/keydownEvent.js"
import { importHighlighter, importTexRenderer } from "../scripts/importer.js"
import el from "./markdown/utils/el.js"
import mdResolver from "./markdown/index.js"
import pageManager from "../scripts/pageManager.js"

const articleEl        = document.querySelector("article:not(#directory-description)")
const mainEl           = document.querySelector("main")
const dirDescriptionEl = mainEl.querySelector("#directory-description")
const parentDirBtn     = mainEl.querySelector("#previous-dir li")
const articleList      = mainEl.querySelector("#article-list")

// ----------------
// article renderer
// ----------------

articleEl.addEventListener("click", (e) => {
    const target = e.target
    if (target.tagName == "IMG") {
        window.open(target.src)
    }
})

function mdEntry(mdContent) {
    // language names to import
    globalThis.__LanguageList__ = new Set()
    // to deside whether to import `katex`
    globalThis.__ContainsFormula__ = false
    // used to dynamic generate iframe id
    globalThis.__IframeCounter__ = 0

    const structure = mdResolver(mdContent)

    let resultNodes = structure
        .map(node => node.toHTML())
    if (!resultNodes.length) {
        resultNodes = el("h1", "404 Not Found")
    }
    return resultNodes
}

export function articleRender(articleContent) {
    const resultNodes = mdEntry(articleContent)
    articleEl.innerHTML = ""
    resultNodes.forEach(el => articleEl.appendChild(el))

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
    pageManager.back()
    // return to parent
    location.hash = splited.slice(0, -2).join("/") + "/"
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
        location.hash += target.innerText
    } else {
        // in `newest` page
        pageManager.open()
        location.hash = target.getAttribute("data-target-blog")
    }
})

export function newestItemRenderer(item) {
    const createDate = new Date(item.timestamp)
    const formatedDate = new Intl.DateTimeFormat().format(createDate)
    const dateEl  = el("code", formatedDate)
    const titleEl = el("span", item.title)
    return el("li",
        [dateEl, el("text", ": "), titleEl],
        {
            tabindex: 0,
            "data-target-blog": item.link
        }
    )
}
export function directoryItemRenderer(item) {
    return el("li", el("span", item), {
        tabindex: 0
    })
}

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

    dirDescriptionEl.innerHTML = ""
    if ("directoryDescription" in indexing) {
        // render directory description
        const resultNodes = mdEntry(indexing.directoryDescription)
        resultNodes.forEach(el => dirDescriptionEl.appendChild(el))
        dirDescriptionEl.querySelectorAll("[tabindex='0']").forEach((el) => {
            el.onkeydown = keydownEvent(el)
        })

        importHighlighter().then(() => globalThis.__LanguageList__ = null)
        importTexRenderer().then(() => globalThis.__ContainsFormula__ = false)
    }

    // reset articleList content
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

    // return to the top
    document.body.scrollTop = 0
    document.documentElement.scrollTop = 0
}
