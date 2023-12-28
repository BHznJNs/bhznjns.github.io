import el from "./utils/el.js"

// identifier character array
const keyTermArray = [
    "#",
    "`",
    "_",
    "/",
    "-",
    ":",
    ",",
    "'",
    "$",
]
// identifier character to HTML tag
const KeyToken_TagName_map = new Map([
    ["##", "strong"],
    ["``", "code"],
    ["__", "u"],
    ["//", "i"],
    ["--", "del"],
    ["::", "span.dim"],
    [",,", "sub"],
    ["''", "sup"],
    ["$$", "span.math"],
])

// --- --- --- --- --- ---

class Token {
    constructor(type, content) {
        this.type = type
        this.content = content
    }

    static key  = Symbol("key")
    static link = Symbol("link")
    static text = Symbol("text")
}

class LinkToken extends Token {
    constructor(content, address) {
        super()

        this.type = Token.link
        this.content = content
        this.address = address
    }

    toHTML() {
        if (this.address.startsWith("http")) {
            // internet links
            return el("a", this.content, {
                href: this.address,
                target: "_blank"
            })
        }

        // static resources or links
        const actualAddress = "static/" + this.address
        return el("a", this.content, {
            href: "#" + actualAddress
        })
    }
}

// --- --- --- --- --- ---

// ("abc]", "]") -> "abc"
export function getInterval(text, endSign) {
    let intervalText = ""
    let isEscape = false

    while (text.length) {
        const ch = text.slice(0, 1)
        text = text.substr(1)

        if (ch == "\\") {
            isEscape = !isEscape
            continue
        }
        if (ch == endSign && !isEscape) {
            break
        }
        intervalText += ch
        isEscape = false
    }

    return intervalText
}

function tokenize(text) {
    const tokens = []
    let textTerm = ""
    let keyTerm  = ""
    let isEscape = false

    while (text.length) {
        const ch = text.slice(0, 1)
        text = text.substr(1)

        // link resolve
        if (ch == "[" && !isEscape) {
            tokens.push(new Token(Token.text, textTerm))
            textTerm = ""

            const linkDisplay = getInterval(text, "]")
            text = text.substr(linkDisplay.length + 1)

            let ch = text.slice(0, 1)
            text = text.substr(1)
            if (ch == "(" && !isEscape) {
                const linkSelf = getInterval(text, ")")
                text = text.substr(linkSelf.length + 1)
                tokens.push(new LinkToken(linkDisplay, linkSelf))
            }
            continue
        }

        if (keyTermArray.includes(ch) && !isEscape) {
            // keyTerm = "#" && ch = "#"
            if (keyTerm.length && keyTerm == ch) {
                tokens.push(new Token(Token.text, textTerm))
                tokens.push(new Token(Token.key , keyTerm + ch))
                keyTerm  = ""
                textTerm = ""
            } else {
                keyTerm = ch
            }
        } else {
            if (ch == "\\") {
                isEscape = !isEscape
                continue
            }
            if (keyTerm.length) {
                textTerm += keyTerm
                keyTerm = ""
            }

            if (isEscape) {
                textTerm += "\\"
                isEscape = false
            }
            textTerm += ch
        }
    }

    if (textTerm.length) {
        tokens.push(new Token(Token.text, textTerm))
    }
    if (keyTerm.length) {
        tokens.push(new Token(Token.text, keyTerm))
    }

    return tokens
}

function convert(tokens) {
    let resultHTML = []
    let identifier = ""
    let tagContent = ""

    for (const token of tokens) {
        switch (token.type) {
            case Token.key:
                if (identifier.length && token.content == identifier) {
                    const tagName = KeyToken_TagName_map.get(identifier)
                    if (tagName.includes(".")) {
                        const [realTagName, className] = tagName.split(".")
                        if (identifier == "$$") {
                            // formula sign
                            globalThis.__ContainsFormula__ = true
                        }
                        resultHTML.push(el(realTagName, tagContent, {
                            "class": className
                        }))
                    } else {
                        resultHTML.push(el(tagName, tagContent))
                    }

                    identifier = ""
                    tagContent = ""
                } else {
                    identifier = token.content
                }
                break
            case Token.text:
                if (!identifier.length) {
                    resultHTML.push(el("text", token.content))
                } else {
                    tagContent = token.content
                }
                break
            case Token.link:
                resultHTML.push(token.toHTML())
                break
        }
    }
    return resultHTML
}

export default function(rawText) {
    const tokens = tokenize(rawText)
    const resultHTML = convert(tokens)
    return resultHTML
}
