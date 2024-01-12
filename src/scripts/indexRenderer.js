import articleRender from "./articleRenderer.js"
import el from "../utils/el.js"
import keydownEvent from "../utils/keydownEvent.js"

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

const mainEl           = document.querySelector("main")
const articleEl        = document.querySelector("article:not(#directory-description)")
const articleList      = mainEl.querySelector("#article-list")
const dirDescriptionEl = mainEl.querySelector("#directory-description")

export default function indexRender(indexing, itemResolver) {
    // calculate & set properties
    const {current, total} = indexing
    let isFirstPage = false
    let isLastPage  = false
    let isOnlyPage  = false
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
    mainEl.setAttribute("data-is-last-page" , isLastPage)
    mainEl.setAttribute("data-is-only-page" , isOnlyPage)

    // --- --- --- --- --- ---
    
    // reset directory description
    dirDescriptionEl.innerHTML = ""
    if ("directoryDescription" in indexing) {
        articleRender(dirDescriptionEl, indexing.directoryDescription)
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
