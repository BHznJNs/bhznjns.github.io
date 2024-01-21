import pathManager from "../scripts/pathManager"
import "../styles/components/catalog.css"
import el from "../utils/el.js"
import eventbus from "../utils/eventbus/inst.js"
import throttle from "../utils/throttle"

function catalogItemRenderer({ level, content, id }) {
    const contentEl = el("span", content, {
        "class": "underline-target"
    })
    return el("li", contentEl, {
        "class": [
            "level-" + level,
            "underline-through",
        ].join(" "),
        "data-target-headline": id
    })
}

function scrollToTarget(e) {
    const targetId = e.target.getAttribute("data-target-headline")
    if (!targetId) {
        return
    }
    const targetHeadlineEl = document.getElementById(targetId)
    const scrollTargetPos = targetHeadlineEl.offsetTop
    const scrollOffset = -16
    window.scroll({
        top: scrollTargetPos + scrollOffset,
        behavior: "smooth",
    })
}

class Catalog extends HTMLElement {
    rootNode = null
    constructor() {
        super()

        this.rootNode = el("ol")
        this.classList.add("hidden")
        this.appendChild(this.rootNode)
        this.#appendEvent()
    }

    #appendEvent() {
        this.rootNode.addEventListener("click", throttle(scrollToTarget, 200))
        window.addEventListener("hashchange", () => {
            if (pathManager.isIn.article()) {
                return
            }
            this.classList.add("hidden")
            eventbus.emit("catalog-closed")
        })
        eventbus.on("catalog-toggle", () => {
            this.classList.toggle("hidden")
        })
        eventbus.on(
            "article-rendered",
            this.render.bind(this)
        )
    }

    // input: [{ level, content }]
    async render(items) {
        this.rootNode.innerHTML = ""
        items
            .map(catalogItemRenderer)
            .forEach(el => this.rootNode.appendChild(el))
    }
}
customElements.define("article-catalog", Catalog)
