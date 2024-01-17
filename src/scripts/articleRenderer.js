import { importHighlighter, importTexRenderer } from "./importer.js"
import mdResolver from "../utils/markdown/index.js"
import keydownEvent from "../utils/keydownEvent.js"
import backToTop from "../utils/backToTop.js"
import getRem from "../utils/getRem.js"

const articleEl = document.querySelector("article")
let fontSizeOffset = 0
function setIframesRem(fontSize) {
    const embeddedIframes = document.querySelectorAll("article iframe[srcdoc]")
    embeddedIframes.forEach(el =>
        el.contentWindow.postMessage({ fontSize }, "*"))
}
function textScalerCreator(callback) {
    return function() {
        callback()
        const baseSize = getRem()
        const targetFontSize = baseSize + fontSizeOffset + "px"
        articleEl.style.fontSize = targetFontSize
        setIframesRem(targetFontSize)
    }
}
export const enlargeText  = textScalerCreator(() => fontSizeOffset += 1)
export const downsizeText = textScalerCreator(() => fontSizeOffset -= 1)

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

    articleEl.style.display = "block"
    articleEl.querySelectorAll("[tabindex='0']").forEach((el) => {
        el.onkeydown = keydownEvent(el)
    })
    backToTop()

    importHighlighter().then(() => globalThis.__LanguageList__ = null)
    importTexRenderer().then(() => globalThis.__ContainsFormula__ = false)
}
