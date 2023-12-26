import { FormulaBlock } from "../node.js"

export default function(_, lines) {
    let formulaContent = ""
    while (lines.length) {
        const l = lines.shift()

        if (l == "$$$") {
            break
        }

        formulaContent += l + "\n"
    }
    return new FormulaBlock(formulaContent)
}
