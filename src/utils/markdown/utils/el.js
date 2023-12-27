function propSetter(el, props) {
    if (!props) {
        return
    }
    for (const [key, val] of Object.entries(props)) {
        el.setAttribute(key, val)
    }
}

function contentSetter(el, content) {
    if (content instanceof Array) {
        // array of html element
        for (const childEl of content) {
            el.appendChild(childEl)
        }
    } else if (content instanceof HTMLElement) {
        // single element
        el.appendChild(content)
    } else if (typeof content == "string") {
        // common text
        el.textContent = content
    } else {
        throw Error("Unexpected element content: " + content)
    }
}

export default function el(tagName, content, props=null) {
    if ("document" in globalThis) {
        // in browser
        if (tagName == "text") {
            return document.createTextNode(content)
        }

        const targetEl = document.createElement(tagName)
        propSetter(targetEl, props)
        contentSetter(targetEl, content)
        return targetEl
    } else {
        // in node.js
        function propToString(props) {
            const resultStrArr = []
            for (const [key, val] of Object.entries(props)) {
                resultStrArr.push(`${key}="${val.toString()}"`)
            }
            return resultStrArr.join(" ")
        }

        if (content instanceof Array) {
            content = content.join("")
        }
        switch (tagName) {
            case "text":
                return content
            case "hr":
                return "<hr>"
            case "img":
                return `<img ${props ? " " + propToString(props) : ""}>`
        }
        return `<${tagName}${props ? " " + propToString(props) : ""}>${content}</${tagName}>`
    }
}
