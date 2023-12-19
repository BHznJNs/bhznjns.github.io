import hljs from "../highlight-es/highlight.js"
import keydownEvent from "./keydownEvent.js"

const articleEl   = document.querySelector("article")
const mainEl      = document.querySelector("main")
const previoudDirBtn = mainEl.querySelector("#previous-dir li")
const articleList = mainEl.querySelector("#article-list")

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

    let resultHTML = structure
        .map(node => node.toHTML())
        .join("")
    if (!resultHTML.length) {
        resultHTML = "<h1>空文章</h1>"
    }

    mainEl.style.display = "none"
    articleEl.style.display = "block"
    articleEl.innerHTML = resultHTML

    articleEl.querySelectorAll("[tabindex='0']").forEach((el) => {
        el.onkeydown = keydownEvent(el)
    })

    // dynamically import language definitions
    const languageListArr = Array.from((globalThis.__LanguageList__))
    const langDefImporters = languageListArr
        .filter(name => !hljs.getLanguage(name))
        .map(lang => import(`../highlight-es/languages/${lang.toLowerCase()}.min.js`))
    globalThis.__LanguageList__ = null
    Promise.all(langDefImporters)
        .then(langDefs => langDefs.forEach((defModule, index) => {
            const name = languageListArr[index]
            const def  = defModule.default
            hljs.registerLanguage(name, def)
        }))
        .then(() => hljs.highlightAll())
        .catch(err => console.error(err))
}

// --------------
// index renderer
// --------------

previoudDirBtn.addEventListener("click", () => {
    const splited = location.hash.split("/")
    location.hash = splited.slice(0, -2).join("/") + "/"
})
articleList.addEventListener("click", (e) => {
    const target = e.target
    if (target.innerText.endsWith("/")) {
        globalThis.CurrentPage = 1
    }
    location.hash += target.innerText
})

const listItem = (content) => `<li tabindex="0">${content}</li>`
export function indexRender(indexing) {
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
    articleList.innerHTML = indexing
        .content
        .map(item => listItem(item))
        .join("")
    // set keyboard event
    articleList.querySelectorAll("[tabindex='0']").forEach((el) => {
        el.onkeydown = keydownEvent(el)
    })

    // --- --- --- --- --- ---

    articleEl.style.display = "none"
    mainEl.style.display = "block"
}