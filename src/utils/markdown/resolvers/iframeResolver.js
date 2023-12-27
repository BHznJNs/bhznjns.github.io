import { IframeBlock, IframeInline } from "../node.js"

export default function(firstLine, lines) {
    if (!firstLine.startsWith("@@@")) {
        // link to out resource
        return new IframeBlock(firstLine)
    }

    // inline HTML
    const description = firstLine.slice(3)
    let iframeContent = ""
    while (lines.length) {
        const l = lines.shift()

        if (l == "@@@") {
            break
        }

        iframeContent += l + "\n"
    }
    return new IframeInline(iframeContent, description)
}