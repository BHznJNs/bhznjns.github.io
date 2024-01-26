import importStyle from "./style.js"
import config from "../../../build.config.js"

let katex = null
const { katexOptions } = config

export default async function(isContainsFormula=false) {
    function renderFormula() {
        // render all formula element
        document.querySelectorAll(".math")
            .forEach(el => {
                const texString = el.textContent
                try {
                    katex.render(texString, el, katexOptions)
                } catch(e) {
                    if (e instanceof katex.ParseError) {
                        // KaTeX can't parse the expression
                        el.innerHTML = ("Error in LaTeX '" + texString + "': " + e.message)
                            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    } else {
                        // other error
                        throw e
                    }
                }
            })
    }

    if (!isContainsFormula) {
        // no formula
        return
    }
    if (katex) {
        renderFormula()
        return
    }

    // dynamically import katex style and script 
    importStyle("./dist/libs/katex/katex.min.css")
    try {
        const katexModule = await import("../../libs/katex/katex.min.js")
        katex = katexModule.default
        renderFormula()
    } catch(e) {
        console.error(e)
    }
}