import config from "../../../build.config.js"
import inlineResolver, { getInterval } from "./inline.js"
import el from "./utils/el.js"

const { language } = config

class BaseNode {
    tagName = ""
    content = ""

    toHTML() {
        const inline = inlineResolver(this.content)
        return el(this.tagName, inline)
    }
}

export class Headline extends BaseNode {
    constructor(content) {
        super()

        // "### test" -> "###"
        const splited = content.split(" ")
        const numberSignStr = splited[0]
        let numberSignCount = 0
        for (const ch of numberSignStr) {
            if (ch == '#') {
                numberSignCount += 1
            }
        }

        if (numberSignCount > 6) {
            numberSignCount = 0
        }

        this.tagName = "h" + numberSignCount
        this.content = splited.slice(1).join(" ")
    }

    static pattern = source => source.match(/^(#+ )/)
}

export class Para extends BaseNode {
    tagName = "p"

    constructor(content) {
        super()
        this.content = content.trimStart()
    }
}

export class Quote extends BaseNode {
    tagName = "blockquote"
    children = []

    constructor(children) {
        super()
        this.children = children
    }
    toHTML() {
        const innerHTML = this.children
            .map(node => node.toHTML())
        return el(this.tagName, innerHTML)
    }

    static pattern = source => source.startsWith("> ")
}

export class Divider extends BaseNode {
    toHTML = () => el("hr", [])
    static pattern = source =>
        source.match(/(-\s*-\s*-)|(\*\s*\*\s*\*)/) && !source.match(/[a-zA-Z0-9]/)
}

export class List extends BaseNode {
    children = []

    constructor(content) {
        super()

        this.isOrdered = Boolean(List.orderedPattern(content))
        this.tagName   = (this.isOrdered) ? "ol" : "ul"
        this.children  = [List.getContent(content, this.isOrdered)]
    }

    push = child => this.children.push(child)

    toHTML() {
        const childrenHTML = []
        for (const child of this.children) {
            if (typeof child == "string") {
                const inline = inlineResolver(child)
                childrenHTML.push(el("li", inline))
            } else {
                childrenHTML.push(child.toHTML())
            }
        }
        return el(this.tagName, childrenHTML)
    }

    static unorderedPattern = (source) => Boolean(source.match(/^([\s\t]*[+-]+ )/))
    static orderedPattern = (source) => Boolean(source.match(/^([\s\t]*[0-9]+. )/))

    static isListPattern = (source) =>
        List.orderedPattern(source) || List.unorderedPattern(source)

    static getContent(line, isOrdered) {
        if (isOrdered) {
            // "1. ..." => "..."
            return line.match(/(?<=^([\s\t]*[0-9]+. )).+$/g)[0]
        } else {
            // "- ..." => "..."
            return line.match(/(?<=^([\s\t]*[+-]+ )).+$/g)[0]
        }
    }
}

export class Table extends BaseNode {
    headerCells = [""]   // [string]
    bodyRows    = [[""]] // [[string]]

    constructor(headerCells, bodyRows) {
        super()

        this.headerCells = headerCells
        this.bodyRows    = bodyRows
    }

    #tableHeaderCell = content => el("th", content)
    #tableBodyCell   = content => el("td", inlineResolver(content))
    #tableHeaderRow  = row => el("tr", row.map(this.#tableHeaderCell))
    #tableBodyRow    = row => el("tr", row.map(this.#tableBodyCell))

    toHTML() {
        const tableHeader = el(
            "thead",
            this.#tableHeaderRow(this.headerCells)
        )
        const tableBody = el(
            "tbody",
            this.bodyRows
                .map(this.#tableBodyRow)
        )
        return el("table", [tableHeader, tableBody])
    }

    static pattern = source => source.startsWith("| ")
}

// --- --- --- --- -
// media nodes start
// --- --- --- --- -

class MediaNode extends BaseNode {
    source = ""
    description = ""    
    constructor(mdText) {
        super()

        mdText = mdText.substr(2)
        this.description = getInterval(mdText, "]")
        mdText = mdText.substr(this.description.length + 2)
        this.source = getInterval(mdText, ")")
    }

    static containerGenerator(content) {
        return el("div", content, {
            "class": "media-container"
        })
    }

    static patternGenerator(identifierSign) {
        return (source) =>
            source.startsWith(identifierSign + "[") && source.endsWith(")")
    }

    static replaceContentGenerator(href, description) {
        let downloadEl
        if (language == "cn") {
            downloadEl = el("a", "从这里下载！", { href })
        } else if (language == "en") {
            downloadEl = el("a", "Download this!", { href })
        }
        const replaceContent = `${description}<br>${downloadEl}`
        return replaceContent
    }

    static srcUrlResolver(rawUrl) {
        let actualUrl
        if (rawUrl.startsWith("http")) {
            actualUrl = rawUrl
        } else {
            if ("location" in globalThis) {
                // in browser
                const hash = location.hash.slice(1)
                // get the parent directory path
                const currentPath = hash.split("/").slice(0, -1).join("/")
                actualUrl = currentPath + "/" + rawUrl
            } else {
                // in nodejs
                const path = globalThis.__ResourcePath__
                actualUrl = path + "/" + rawUrl
            }
        }
        return actualUrl
    }
}

export class Image extends MediaNode {
    static pattern = MediaNode.patternGenerator("!")

    toHTML() {
        const actualUrl = MediaNode.srcUrlResolver(this.source)
        const imageEl = el("img", [], {
            src: actualUrl,
            alt: this.description,
            loading: "lazy",
            tabindex: 0,
        })
        return MediaNode.containerGenerator(imageEl)
    }
}

export class Audio extends MediaNode {
    static pattern = MediaNode.patternGenerator(":")

    toHTML() {
        const actualUrl = MediaNode.srcUrlResolver(this.source)
        const replaceContent = MediaNode.replaceContentGenerator(actualUrl, this.description)
        const audioEl = el("audio", replaceContent, {
            src: actualUrl,
            controls: true,
        })
        return MediaNode.containerGenerator(audioEl)
    }
}

export class Video extends MediaNode {
    static pattern = MediaNode.patternGenerator("?")

    toHTML() {
        const actualUrl = MediaNode.srcUrlResolver(this.source)
        const replaceContent = MediaNode.replaceContentGenerator(actualUrl, this.description)
        const videoEl = el("video", replaceContent, {
            src: actualUrl,
            controls: "true",
        })
        return MediaNode.containerGenerator(videoEl)
    }
}

export const isIframePattern = (source) =>
    MediaNode.patternGenerator("@")(source)
    || source.startsWith("@@@")

export class Iframe extends MediaNode {
    toHTML() {
        const actualUrl = MediaNode.srcUrlResolver(this.source)
        const iframeEl = el("iframe", this.description, {
            src: actualUrl,
            title: this.description,
            sandbox: "allow-scripts",
        })
        return MediaNode.containerGenerator(iframeEl)
    }
}

// --- --- --- ---
// media nodes end
// --- --- --- ---

// --- --- --- --- -
// block nodes start
// --- --- --- --- -

export class CodeBlock extends BaseNode {
    constructor(content, lang) {
        super()

        this.lang = lang
        if (typeof window == "object") {
            // in browser
            this.content = content
        } else {
            // in node.js
            this.content = content
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;")
        }
    }
    append(content) {
        this.content += content
    }
    toHTML() {
        if (typeof window == "object") {
            globalThis.__LanguageList__.add(this.lang)
        }
        const codeEl = el(
            "code",
            this.content,
            {
                "class": `language-${this.lang}`,
                "data-language": this.lang.toUpperCase(),
            }
        )
        return el("pre", codeEl)
    }

    static pattern = source => source.startsWith("```")
}

export class FormulaBlock extends BaseNode {
    content = ""
    description = ""

    constructor(content, description) {
        super()

        this.content = content
        this.description = description
    }
    toHTML() {
        globalThis.__ContainsFormula__ = true
        return el("div", this.content, {
            "class": "math",
            title: this.description,
        })
    }

    static pattern = source =>
        source.startsWith("$$$")
}

export class IframeBlock extends BaseNode {
    static #injectedHeightSender = id => `\
<script>
window.addEventListener("load", (e) => {
    const iframeRootEl = e.target.documentElement
    const parent = window.parent
    const height = parseFloat(getComputedStyle(iframeRootEl).height)
    parent.postMessage({
        height,
        id: "${id}"
    }, "*")
})
</script>`

    constructor(content, description) {
        super()

        globalThis.__IframeCounter__ += 1
        this.id = "iframe_" + globalThis.__IframeCounter__
        this.description = description

        if (typeof window == "object") {
            // in browser
            this.content = content + IframeBlock.#injectedHeightSender(this.id)
        } else {
            // in node.js
            this.content = content
        }
    }

    toHTML() {
        const iframeEl = el("iframe", this.description, {
            id: this.id,
            title: this.description,
            srcdoc: this.content,
            sandbox: "allow-scripts",
        })
        return MediaNode.containerGenerator(iframeEl)
    }
}

// --- --- --- ---
// block nodes end
// --- --- --- ---
