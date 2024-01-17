import pathManager from "../scripts/pathManager.js"
import config from "../../build.config.js"
import el from "../utils/el.js"
import backToTop from "../utils/backToTop.js"
import languageSelector from "../utils/languageSelector.js"
import { downsizeText, enlargeText } from "../scripts/articleRenderer.js"

const fabItem = (id, title) => el(
    "button",
    el("div"),
    { id, title }
)

class FabIcon extends HTMLElement {
    #switcher = null
    #subItems = {}

    constructor() {
        super()

        const switcher = this.#switcher = fabItem("switcher", languageSelector("切换浮动操作按钮", "Switch The FAB"))
        this.#subItems.backToParent = fabItem("back-to-parent", languageSelector("返回父级", "Back to Parent"))
        this.#subItems.backToTop    = fabItem("back-to-top", languageSelector("返回顶部", "Back to Top"))
        this.#subItems.enlargeText  = fabItem("enlarge-text", languageSelector("放大文本", "Enlarge Text"))
        this.#subItems.downsizeText = fabItem("downsize-text", languageSelector("缩小文本", "Downsize Text"))

        const subFabItem = config.fabOrdering
            .map(fabItem => this.#subItems[fabItem])
            .filter(fabItem => fabItem !== undefined)
        for (const [index, item] of Object.entries(subFabItem)) {
            item.style.setProperty("--fab-item-index", Number(index) + 1)
        }

        this.classList.add("hidden")
        this.#eventAppender()
        this.style.setProperty("--fab-item-count", subFabItem.length + 1)
        for (const el of [switcher].concat(subFabItem)) {
            this.appendChild(el)
        }
    }

    #eventAppender() {
        this.#switcher.addEventListener("click", () => {
            this.classList.toggle("hidden")
        })
        this.#subItems.backToParent.addEventListener("click", () => {
            console.log(pathManager.parent())
            pathManager.jumpTo(pathManager.parent())
        })
        this.#subItems.backToTop.addEventListener("click", backToTop)
        this.#subItems.enlargeText.addEventListener("click", enlargeText)
        this.#subItems.downsizeText.addEventListener("click", downsizeText)
    }
}
customElements.define("fab-icon", FabIcon)
