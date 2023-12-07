import inlineResolver, { getInterval } from "./inline.js"

class BaseNode {
    tagName = ""
    content = ""

    toHTML() {
        const inline = inlineResolver(this.content)
        return `<${this.tagName}>${inline}</${this.tagName}>`
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

    static pattern = (source) => source.match(/^(#+ )/)
}

export class Para extends BaseNode {
    tagName = "p"
    constructor(content) {
        super()
        this.content = content.trimStart()
    }
}

export class Quote extends BaseNode {
    children = []

    constructor(children) {
        super()
        this.children = children
    }
    toHTML() {
        let resultHTML = ""
        for (const node of this.children) {
            resultHTML += node.toHTML()
        }
        return `<blockquote>${resultHTML}</blockquote>`
    }

    static pattern = (source) => source.startsWith("> ")
}

export class Divider extends BaseNode {
    toHTML() {
        return "<hr>"
    }
    static pattern = (source) =>
        source.match(/(-\s*-\s*-)|(\*\s*\*\s*\*)/) && !source.match(/[a-zA-Z0-9]/)
}

export class List extends BaseNode {
    children = []

    constructor(content) {
        super()

        this.isOrdered = Boolean(List.orderedPattern(content))

        this.tagName = (this.isOrdered) ? "ol" : "ul"
        this.children = [List.getContent(content, this.isOrdered)]
    }

    push = (child) => this.children.push(child)

    toHTML() {
        let resultHTML = `<${this.tagName}>`
        for (const child of this.children) {
            if (typeof child == "string") {
                const inline = inlineResolver(child)
                resultHTML += `<li>${inline}</li>`
            } else {
                try {
                    resultHTML += child.toHTML()
                } catch {
                    // console.log(child);
                }
                
            }
        }
        resultHTML += `</${this.tagName}>`
        return resultHTML
    }

    static unorderedPattern = (source) => Boolean(source.match(/^([\s\t]*[+-]+ )/))
    static orderedPattern   = (source) => Boolean(source.match(/^([\s\t]*[0-9]+. )/))

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

export class CodeBlock extends BaseNode {
    constructor(content, lang) {
        super()

        this.lang = lang
        this.content = content
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
    }
    append(content) {
        this.content += content
    }
    toHTML() {
        return `<pre><code class="language-${this.lang}">${this.content}</code></pre>`
    }

    static pattern = (source) => source.startsWith("```")
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

        return `<div class="img"><img src="${actualAddress}" alt="${this.alt}" tabindex="0"></div>`
    }

    static pattern = (source) => source.startsWith("![") && source.endsWith(")")
}