/**
 * @param {string} path 
 * @param {"script" | "style" | "image" | "font" | "fetch"} as_
 */
export default function preloadResource(path, as_) {
    return new Promise((resolve, reject) => {
        const linkEl = document.createElement("link")
        linkEl.rel = "preload"
        linkEl.href = path
        linkEl.as = as_

        if (as_ === 'font') {
            linkEl.crossOrigin = "anonymous"
        }
        document.head.appendChild(linkEl)
        linkEl.onload = resolve
        linkEl.onerror = reject
    })
}
