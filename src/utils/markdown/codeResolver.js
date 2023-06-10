import { CodeBlock } from "./node.js"

export default function(firstLine, lines) {
    const lang = firstLine.slice(3)
    let codeContent = ""
    while (lines.length) {
        const l = lines.shift()

        if (l == "```") {
            break
        }

        codeContent += l
    }
    return new CodeBlock(codeContent, lang)
}