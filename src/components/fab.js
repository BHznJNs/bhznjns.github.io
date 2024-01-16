import pathManager from "../scripts/pathManager.js"
import el from "../utils/el.js"
import backToTop from "../utils/backToTop.js"
import languageSelector from "../utils/languageSelector.js"

const fabItem = (id, description) => el("button", el("div", "", {
    "data-image-name": id
}), {
    id: id,
    title: description,
})

class FabIcon extends HTMLElement {
    #elements = {}

    constructor() {
        super()

        const switcher = this.#elements.switcher = fabItem("switcher", languageSelector("切换浮动操作按钮", "Switch The FAB"))
        const backToParent = this.#elements.backToParent = fabItem("back-to-parent", languageSelector("返回父级", "Back to Parent"))
        const backToTop = this.#elements.backToTop = fabItem("back-to-top", languageSelector("返回顶部", "Back to Top"))
        const subFabItem = [backToParent, backToTop]
        for (const [index, item] of Object.entries(subFabItem)) {
            item.style.setProperty("--fab-item-index", Number(index) + 1)
        }

        this.classList.add("hidden")
        this.#eventAppender()
        for (const el of [switcher].concat(subFabItem)) {
            this.appendChild(el)
        }
    }

    #eventAppender() {
        this.#elements.switcher.addEventListener("click", () => {
            this.classList.toggle("hidden")
        })
        this.#elements.backToParent.addEventListener("click", () => {
            console.log(pathManager.parent())
            pathManager.jumpTo(pathManager.parent())
        })
        this.#elements.backToTop.addEventListener("click", () => {
            backToTop()
        })
    }
}
customElements.define("fab-icon", FabIcon)
