import el from "./utils/el.js"
import getInterval from "./utils/getInterval.js"

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

    static key      = Symbol("key")
    static text     = Symbol("text")
    static link     = Symbol("link")
    static phonetic = Symbol("phonetic")
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

class PhoneticToken extends Token {
    constructor(content, notation) {
        super()

        this.type = Token.phonetic
        this.content  = content
        this.notation = notation
    }
    toHTML() {
        const ignoredLeftParenthesis = el("rp", "(")
        const ignoredRightParenthesis = el("rp", ")")
        const cjkNotation = el("span", el("span", this.notation), {
            "class": "cjk-notation-container"
        })
        const cjkText = el("span", el("span", this.content), {
            "class": "cjk-text-container"
        })
        const notation = el("rt", this.notation)

        return el("ruby", [
            cjkNotation,
            cjkText,
            ignoredLeftParenthesis,
            notation,
            ignoredRightParenthesis,
        ])
    }
}

// --- --- --- --- --- ---

function tokenize(text) {
    const tokens = []
    let textTerm = ""
    let keyTerm  = ""
    let isEscape = false

    while (text.length) {
        const ch = text.slice(0, 1)
        text = text.substr(1)

        let lastType = tokens.length && tokens[tokens.length - 1].type

        // special inline rules resolve
        if (["[", "{"].includes(ch) && !isEscape && lastType == Token.text) {
            const specialTokenSign = ch
            tokens.push(new Token(Token.text, textTerm))
            textTerm = ""

            const displayContent = getInterval(text, specialTokenSign)
            text = text.substr(displayContent.length + 1)

            const _ch = text.slice(0, 1)
            text = text.substr(1)

            if (_ch != "(") {
                // if there is no left parenthesis("(") follows
                // the `[...]` or `{...}`, directly append the content
                // before into the `textTerm`
                textTerm += specialTokenSign + displayContent + specialTokenSign
                textTerm += _ch
                continue
            }

            let targetTokenType
            if (specialTokenSign == "[") {
                targetTokenType = LinkToken
            } else
            if (specialTokenSign == "{") {
                targetTokenType = PhoneticToken
            } else { /* unreachable */ }

            const hiddenContent = getInterval(text, ")")
            text = text.substr(hiddenContent.length + 1)
            tokens.push(new targetTokenType(displayContent, hiddenContent))
            continue
        }

        if (keyTermArray.includes(ch)) {
            // keyTerm = "#" && ch = "#"
            if (isEscape) {
                textTerm += ch
                isEscape = false
                continue
            }

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
                if (!(identifier.length && token.content == identifier)) {
                    identifier = token.content
                    continue
                }
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
                break
            case Token.text:
                if (!identifier.length) {
                    resultHTML.push(el("text", token.content))
                } else {
                    tagContent = token.content
                }
                break
            case Token.link:
            case Token.phonetic:
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
