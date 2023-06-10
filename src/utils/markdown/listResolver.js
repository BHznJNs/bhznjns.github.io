import { List } from "./node.js"
import getIndent from "./utils/getIndent.js"

export default function listResolver(currentLine, lines) {
    const currentIndent = getIndent(currentLine)
    const currentNode = new List(currentLine)
    while (lines.length) {
        let l = lines.shift()
        const lIndent = getIndent(l)
        l = l.trimStart()

        if (List.isListPattern(l)) {
            const isNextOrdered = List.orderedPattern(l)
            if (lIndent > currentIndent) {
                // sub list
                currentNode.push(listResolver(l, lines))
                continue
            } else
            if (lIndent == currentIndent && isNextOrdered == currentNode.isOrdered) {
                currentNode.push(List.getContent(l, isNextOrdered))
                continue
            }
        }

        lines.unshift(l)
        break
    }
    return currentNode
}