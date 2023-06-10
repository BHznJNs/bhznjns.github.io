import hljs from "../highlight-es/highlight.js"

import JavaScript from "../highlight-es/languages/javascript.min.js"
import Python from "../highlight-es/languages/python.min.js"
import Rust from "../highlight-es/languages/rust.min.js"
import JSON from "../highlight-es/languages/json.min.js"
import YAML from "../highlight-es/languages/yaml.min.js"
import Bash from "../highlight-es/languages/bash.min.js"
import XML from "../highlight-es/languages/xml.min.js"
import CSS from "../highlight-es/languages/css.min.js"
import Cpp from "../highlight-es/languages/cpp.min.js"
import C from "../highlight-es/languages/c.min.js"

hljs.registerLanguage("javascript", JavaScript)
hljs.registerLanguage("python", Python)
hljs.registerLanguage("rust", Rust)
hljs.registerLanguage("bash", Bash)
hljs.registerLanguage("json", JSON)
hljs.registerLanguage("yaml", YAML)
hljs.registerLanguage("xml", XML)
hljs.registerLanguage("css", CSS)
hljs.registerLanguage("cpp", Cpp)
hljs.registerLanguage("c", C)

const articleEl   = document.querySelector("article")
const mainEl      = document.querySelector("main")
const previoudBtn = mainEl.querySelector("#previous-dir li")
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
    let resultHTML = ""

    for (const node of structure) {
        resultHTML += node.toHTML()
    }

    if (!resultHTML.length) {
        resultHTML = "<h1>空文章</h1>"
    }

    mainEl.style.display = "none"
    articleEl.style.display = "block"
    articleEl.innerHTML = resultHTML
    hljs.highlightAll()
}

// --------------
// index renderer
// --------------

previoudBtn.addEventListener("click", () => {
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

export function indexRender(indexing) {
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

    let itemsHTML = ""
    for (const item of indexing.content) {
        if (item.endsWith("/")) {
            itemsHTML += `<li>${item}</li>`
        } else {
            itemsHTML += `<li>${item}</li>`
        }
    }
    articleList.innerHTML = itemsHTML
    articleEl.style.display = "none"
    mainEl.style.display = "block"
}