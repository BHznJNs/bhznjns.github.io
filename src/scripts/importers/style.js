export default function importStyle(path) {
    const linkEl = document.createElement("link")
    linkEl.rel  = "stylesheet"
    linkEl.href = path
    document.head.appendChild(linkEl)
}
