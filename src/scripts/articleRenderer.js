import { importHighlighter, importTexRenderer } from "./importer.js"
import mdResolver from "../utils/markdown/index.js"
import keydownEvent from "../utils/keydownEvent.js"

const mainEl = document.querySelector("main")

export default function articleRender(articleEl, mdText) {
    // language names to import
    globalThis.__LanguageList__ = new Set()
    // to deside whether to import `katex`
    globalThis.__ContainsFormula__ = false
    // used to dynamic generate iframe id
    globalThis.__IframeCounter__ = 0

    const structure = mdResolver(mdText)

    let resultNodes = structure
        .map(node => node.toHTML())
    if (!resultNodes.length) {
        resultNodes = el("h1", "Empty")
    }

    // --- --- --- --- --- ---

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
