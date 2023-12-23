function propToString(props) {
    const resultStrArr = []
    for (const [key, val] of Object.entries(props)) {
        resultStrArr.push(`${key}="${val.toString()}"`)
    }
    return resultStrArr.join(" ")
}

export default (tagName, content, props) =>
    `<${tagName}${props ? " " + propToString(props) : ""}>${content}</${tagName}>`
