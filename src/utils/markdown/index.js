import { Headline, Quote, Divider, List, CodeBlock, Para, ImageBlock } from "./node.js"
import { codeResolver, listResolver, quoteResolver } from "./resolvers/index.js"
import getLines from "./utils/getLines.js"

export default function mdResolver(source) {
    const lines = getLines(source)
    const nodes = []

    while (lines.length) {
        const l = lines.shift()

        if (l.length == 0) {
            continue
        }

        if (Headline.pattern(l)) {
            nodes.push(new Headline(l))
        } else
        if (ImageBlock.pattern(l)) {
            nodes.push(new ImageBlock(l))
        } else
        if (Divider.pattern(l)) {
            nodes.push(new Divider)
        } else
        if (Quote.pattern(l)) {
            nodes.push(quoteResolver(l, lines))
        } else
        if (List.isListPattern(l)) {
            nodes.push(listResolver(l, lines))
        } else
        if (CodeBlock.pattern(l)) {
            nodes.push(codeResolver(l, lines))
        } else {
            nodes.push(new Para(l))
        }
    }

    return nodes
}