import inlineResolver, { getInterval } from "./inline.js"
import el from "./utils/el.js"

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
            .map(node =>
                node.toHTML()
            ).join("")
        return el(this.tagName, innerHTML)
    }

    static pattern = source => source.startsWith("> ")
}

export class Divider extends BaseNode {
    toHTML = () => "<hr>"
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
                childrenHTML.push(`<li>${inline}</li>`)
            } else {
                childrenHTML.push(child.toHTML())
            }
        }
        const innerHTML = childrenHTML.join("")
        return el(this.tagName, innerHTML)
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

export class TableBlock extends BaseNode {
    headerCells = [""]   // [string]
    bodyRows    = [[""]] // [[string]]

    constructor(headerCells, bodyRows) {
        super()

        this.headerCells = headerCells
        this.bodyRows    = bodyRows
    }

    #tableHeaderCell = content => el("th", content)
    #tableBodyCell   = content => el("td", content)
    #tableHeaderRow  = row => el("tr", row.map(this.#tableHeaderCell).join(""))
    #tableBodyRow    = row => el("tr", row.map(this.#tableBodyCell).join(""))

    toHTML() {
        const tableHeader = el(
            "thead",
            this.#tableHeaderRow(this.headerCells)
        )
        const tableBody = el(
            "tbody",
            this.bodyRows
                .map(this.#tableBodyRow)
                .join("")
        )
        return el("table", tableHeader + tableBody)
    }

    static pattern = source => source.startsWith("| ")
}

export class CodeBlock extends BaseNode {
    constructor(content, lang) {
        super()

        this.lang = lang
        this.content = content
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")

        if (!globalThis.hljs.getLanguage(lang)) {
            // if language definition is not imported
            import(`../../highlight-es/languages/${lang}.min.js`)
                // register language
                .then(def => globalThis.hljs.registerLanguage(lang, def.default))
                // highlight target code element
                .then(() => document.querySelectorAll("pre code.language-" + lang).forEach(
                    el => hljs.highlightElement(el)
                ))
        }
    }
    append(content) {
        this.content += content
    }
    toHTML() {
        const codeElHTML = `<code class="language-${this.lang}">${this.content}</code>`
        return el("pre", codeElHTML)
    }

    static pattern = source => source.startsWith("```")
}

export class ImageBlock extends BaseNode {
    constructor(content) {
        super()
        content = content.substr(2)
        const alt = getInterval(content, "]")
        content = content.substr(alt.length + 2)
        const address = getInterval(content, ")")

        this.alt = alt
        this.address = address
    }

    toHTML() {
        let actualAddress
        if (this.address.startsWith("http")) {
            actualAddress = this.address
        } else {
            if ("location" in globalThis) {
                // in browser
                const hash = location.hash.slice(1)
                // get the parent directory path
                const currentPath = hash.split("/").slice(0, -1).join("/")
                actualAddress = currentPath + "/" + this.address
            } else {
                // in nodejs
                const path = globalThis.__ResourcePath__
                actualAddress = path + "/" + this.address
            }
        }
        return `<div class="img"><img src="${actualAddress}" alt="${this.alt}" loading="lazy" tabindex="0"></div>`
    }

    static pattern = source => source.startsWith("![") && source.endsWith(")")
}