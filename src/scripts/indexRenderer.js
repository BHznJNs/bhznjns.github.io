import articleRender from "./articleRenderer.js"
import el from "../utils/dom/el.js"
import keydownEvent from "../utils/dom/keydownEvent.js"
import { scrollToTop } from "../utils/dom/scrollControl.js"

export function newestItemRenderer(item) {
    const createDate = new Date(item.createTime)
    const formatedDate = new Intl.DateTimeFormat().format(createDate)
    const titleEl = el("span", item.title, {
        "class": "underline-target"
    })
    const dateEl  = el("code", formatedDate)
    return el("li", [titleEl, dateEl], {
        "class": "underline-through",
        "data-jumpto": item.link,
        tabindex: 0,
    })
}
export function directoryItemRenderer(item) {
    const modityDate = new Date(item.modifyTime)
    const formatedDate = new Intl.DateTimeFormat().format(modityDate)
    const titleEl = el("span", item.name, {
        "class": "underline-target"
    })
    const codeEl = el("code", formatedDate)
    return el("li", [titleEl, codeEl], {
        "class": "underline-through",
        "data-relative": item.name,
        tabindex: 0,
    })
}

const mainEl           = document.querySelector("main")
const articleEl        = document.querySelector("article")
const articleList      = mainEl.querySelector("#article-list")
const dirDescriptionEl = mainEl.querySelector("#directory-description")
const pagingComponent  = mainEl.querySelector("paging-view")

export default function indexRender(indexing, itemResolver) {
    const {current, total} = indexing
    pagingComponent.setPage(current, total)

    // --- --- --- --- --- ---
    
    // reset directory description
    dirDescriptionEl.innerHTML = ""
    if ("directoryDescription" in indexing) {
        articleRender(dirDescriptionEl, indexing.directoryDescription)
    }

    // reset articleList content
    const fragment = document.createDocumentFragment()
    indexing.content
        .map(itemResolver)
        .forEach(el => fragment.appendChild(el))
    articleList.innerHTML = ""
    articleList.appendChild(fragment)

    // set keyboard event
    articleList.querySelectorAll("[tabindex='0']").forEach((el) => {
        el.onkeydown = keydownEvent(el)
    })

    // --- --- --- --- --- ---

    articleEl.innerHTML = ""
    mainEl.classList.remove("hidden")
    scrollToTop()
}
