import renderer from "../src/utils/markdown/index.js"
import { Para } from "../src/utils/markdown/node.js"

export class ArticleInfo {
    title       = ""
    description = ""
    htmlContent = ""
    constructor(title, description, htmlContent) {
        this.title       = title
        this.description = description
        this.htmlContent = htmlContent
    }
}

function getDescription(htmlNodes) {
    let description = ""
    for (const node of htmlNodes) {
        if (node instanceof Para) {
            description = node.content
            break
        }
    }
    return description
}

export default function(source) {
    const htmlNodes = renderer(source)

    const title       = htmlNodes[0].content
    const description = getDescription(htmlNodes)
    const htmlContent = htmlNodes.map(node => node.toHTML()).join("")

    return new ArticleInfo(title, description, htmlContent)
}
