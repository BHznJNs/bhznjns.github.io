let hljs  = null
let katex = null

export async function importHighlighter() {
    function importLangDefs() {
        // dynamically import language definitions
        const languageListArr = Array.from(globalThis.__LanguageList__)
        const langDefImporters = languageListArr
            .filter(name => !hljs.getLanguage(name))
            .map(lang => import(`../libs/highlight-es/languages/${lang.toLowerCase()}.js`))

        Promise.all(langDefImporters)
            .then(langDefs => langDefs.forEach((defModule, index) => {
                const name = languageListArr[index]
                const def  = defModule.default
                hljs.registerLanguage(name, def)
            }))
            .then(() => hljs.highlightAll())
            .catch(err => console.error(err))
    }

    if (globalThis.__LanguageList__.size == 0) {
        // no code blocks
        return
    }

    if (hljs) {
        importLangDefs()
        return
    }

    // import highlight.js itself
    await import("../libs/highlight-es/highlight.js")
        .then(module => hljs = module.default)
        .then(importLangDefs)
        .catch(err => console.error(err))
}

export async function importTexRenderer() {
    function renderFormula() {
        // render all formula element
        document.querySelectorAll(".math")
            .forEach(el => katex.render(el.textContent, el))
    }

    if (!globalThis.__ContainsFormula__) {
        return
    }
    if (katex) {
        renderFormula()
        return
    }

    const tasks = [import("../libs/katex/katex.js"), fetch("dist/katex.min.css")]
    await Promise.all(tasks)
        .then(([module, cssRes]) => {
            // set katex js module & render
            katex = module.default
            renderFormula()
            return cssRes.text()
        })
        .then(cssText => {
            // set katex css
            const style = document.createElement("style")
            style.textContent = cssText
            document.head.appendChild(style)
        })
        .catch(err => console.error(err))
}