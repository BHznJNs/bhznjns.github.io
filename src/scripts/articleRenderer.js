import importHighlighter from "./importers/highlight.js"
import importTexRenderer from "./importers/katex.js"
import importChartRenderer from "./importers/echarts.js"

import mdResolver from "../utils/markdown/index.js"
import keydownEvent from "../utils/dom/keydownEvent.js"
import backToTop from "../utils/dom/backToTop.js"
import eventbus from "../utils/eventbus/inst.js"
import config from "../../build.config.js"
import { Headline } from "../utils/markdown/node.js"
import languageSelector from "../utils/languageSelector.js"

const articleEl = document.querySelector("article")
const emptyArticlePlaceHolder = languageSelector("空文章", "Empty Article")

eventbus.on("catalog-toggle", () => {
    articleEl.classList.toggle("with-catalog")
})
eventbus.on("catalog-closed", () => {
    articleEl.classList.remove("with-catalog")
})

function getHeadlines(structure) {
    return structure
        .filter(node => node instanceof Headline)
        .map((node, index) => {
            const id = node.id = "headline-" + index
            const content = node.content.map(el => el.cloneNode(true))
            return {
                id, content,
                level: node.tagName,
            }
        })
}

export default function articleRender(articleEl, mdText) {
    // language names to import for `highlight.js`
    globalThis.__LanguageList__ = new Set()
    // to deside whether to import `katex`
    globalThis.__ContainsFormula__ = false
    // to deside whether to import `echarts.js`
    globalThis.__ChartOptionList__ = []
    // used to dynamic generate iframe id
    globalThis.__IframeCounter__ = 0

    const structure = mdResolver(mdText)
    if (config.enableCatalog) {
        const headlineItems = getHeadlines(structure)
        eventbus.emit("article-rendered", headlineItems)
    }

    let resultNodes = structure.map(node => node.toHTML())
    if (!resultNodes.length) {
        resultNodes = el("h1", emptyArticlePlaceHolder)
    }

    // --- --- --- --- --- ---

    articleEl.innerHTML = ""
    resultNodes.forEach(el => articleEl.appendChild(el))

    articleEl.style.display = "block"
    articleEl.querySelectorAll("[tabindex='0']").forEach((el) => {
        el.onkeydown = keydownEvent(el)
    })
    backToTop()

    importHighlighter(globalThis.__LanguageList__).then(() => globalThis.__LanguageList__ = null)
    importTexRenderer(globalThis.__ContainsFormula__).then(() => globalThis.__ContainsFormula__ = false)
    importChartRenderer(globalThis.__ChartOptionList__).then(() => globalThis.__ChartOptions__ = null)
}
