import el from "./utils/el.js"
import getInterval from "./utils/getInterval.js"

// identifier character to HTML tag
const KeyToken_TagName_map = new Map([
    ["#", "strong"],
    ["`", "code"],
    ["_", "u"],
    ["/", "i"],
    ["-", "del"],
    [":", "span.dim"],
    [",", "sub"],
    ["'", "sup"],
    ["$", "span.math"],
])

const PairedParenMap = new Map([
    ["[", "]"],
    ["{", "}"],
])

// --- --- --- --- --- ---

class TextToken {
    constructor(content) {
        this.content = content
    }
    toHTML = () => el("text", this.content)
}
class KeyToken {
    constructor(tagSign, content) {
        const tag = KeyToken_TagName_map.get(tagSign)
        if (tag.includes(".")) {
            const [realTagName, className] = tag.split(".")
            this.tagName = realTagName
            this.className = className
        } else {
            this.tagName = tag
        }
        this.content = content

        if (this.className == "math") {
            // set this global variable to import
            // the math formula renderer module
            globalThis.__ContainsFormula__ = true
        }
    }

    toHTML() {
        const thisEl = el(this.tagName, parser(this.content))
        if (this.className) {
            thisEl.setAttribute("class", this.className)
        }
        return thisEl
    }
}

class LinkToken {
    constructor(content, address) {
        this.content = content
        this.address = address
    }

    toHTML() {
        const displayContent = parser(this.content)
        if (this.address.startsWith("http")) {
            // internet links
            return el("a", displayContent, {
                href: this.address,
                target: "_blank"
            })
        }

        // static resources or links
        const actualAddress = "static/" + this.address
        return el("a", displayContent, {
            href: "#" + actualAddress
        })
    }
}
class PhoneticToken {
    constructor(content, notation) {
        this.content  = content
        this.notation = notation
    }
    toHTML() {
        const ignoredLeftParenthesis = el("rp", "(")
        const ignoredRightParenthesis = el("rp", ")")
        const notationEl = el("rt", this.notation)

        const content = parser(this.content).concat([
            ignoredLeftParenthesis,
            notationEl,
            ignoredRightParenthesis,
        ])
        return el("ruby", content, {
            "data-notation": this.notation
        })
    }
}

// --- --- --- --- --- ---

export default function parser(source) {
    function getFirstChar() {
        const ch = source.charAt(0)
        source = source.substring(1)
        return ch
    }
    function getSpecialTokenClass(tokenSign) {
        let targetTokenType
        if (tokenSign == "[") {
            targetTokenType = LinkToken
        } else if (tokenSign == "{") {
            targetTokenType = PhoneticToken
        } else { /* unreachable */ }
        return targetTokenType
    }

    // --- --- --- --- --- ---

    const tokens = []
    let textTerm = "" // text
    let keyTerm  = "" // inline style content
    let keyStart = ""
    let isEscape = false
    let isInKey  = false

    while (source.length) {
        const ch = getFirstChar()

        // key rules resolve
        if (KeyToken_TagName_map.has(ch)) {
            if (isEscape) {
                if (isInKey) {
                    keyTerm += ch
                } else {
                    textTerm += ch
                }
                continue
            }

            if (isInKey && ch != keyStart) {
                keyTerm += ch
                continue
            }

            const nextCh = getFirstChar()
            if (nextCh != ch) {
                textTerm += ch
                source = nextCh + source
                continue
            }

            if (isInKey) {
                tokens.push(new KeyToken(ch, keyTerm))
                keyTerm  = ""
                keyStart = ""
            } else {
                tokens.push(new TextToken(textTerm))
                textTerm = ""
                keyStart = ch
            }
            isInKey = !isInKey
            continue
        }

        // special inline rules resolve
        if (["[", "{"].includes(ch) && !isInKey && !isEscape) {
            const specialTokenSign = ch
            const pairedTokenSign = PairedParenMap.get(specialTokenSign)

            tokens.push(new TextToken(textTerm))
            textTerm = ""

            let removedContent = specialTokenSign
            // the actual displayed content for special inline elements
            const displayContent = getInterval(source, pairedTokenSign)
            if (displayContent != null) {
                removedContent += source.slice(0, displayContent.length + 1)
                source = source.substr(displayContent.length + 1)

                const nextCh = getFirstChar()
                removedContent += nextCh
                if (nextCh == "(") {
                    // the hidden displayed content for special inline elements
                    const hiddenContent = getInterval(source, ")")
                    if (hiddenContent != null) {
                        let targetTokenType = getSpecialTokenClass(specialTokenSign)
                        source = source.substr(hiddenContent.length + 1)
                        tokens.push(new targetTokenType(displayContent, hiddenContent))
                        continue
                    }
                }
            }
            textTerm += removedContent
            continue
        }

        // --- --- --- --- --- ---

        if (ch == "\\") {
            isEscape = !isEscape
            continue
        }

        let text
        if (isEscape) {
            text = "\\" + ch
            isEscape = false
        } else {
            text = ch
        }

        if (isInKey) {
            keyTerm += text
        } else {
            textTerm += text
        }
    }

    if (keyTerm.length) {
        tokens.push(new KeyToken(keyStart, keyTerm))
    }
    if (textTerm.length) {
        tokens.push(new TextToken(textTerm))
    }
    return tokens
        .filter(token =>
            !(token instanceof TextToken && !token.content.length))
        .map(token => token.toHTML())
}

// test cases
// console.log(parser("##bo//itelic//ld##"))
// console.log(parser("##bo[link text](http://www.com)ld##"))
// console.log(parser("asd[asd"))
// console.log(parser("asd[asd]asd"))
// console.log(parser("asd[asd](asd"))
// console.log(parser("asd[asd](asd)"))
// console.log(parser("asd[##link##](asd)"))
// console.log(parser("##asd[link##](asd)"))
// console.log(parser("##asd[link](asd)##"))
// console.log(parser("::dimmed::"))
// console.log(parser("$$f_c = \\frac{1}{abc}$$"))
