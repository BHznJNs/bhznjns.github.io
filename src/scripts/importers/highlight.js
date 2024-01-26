let hljs = null

export default async function(languageList=new Set()) {
    function importLangDefs() {
        // dynamically import language definitions
        const languageListArr = Array.from(languageList)
        const langDefImporters = languageListArr
            .filter(name => !hljs.getLanguage(name))
            .map(lang => import(`../../libs/highlight-es/languages/${lang.toLowerCase()}.js`))

        Promise.all(langDefImporters)
            .then(langDefs => langDefs.forEach((defModule, index) => {
                const name = languageListArr[index]
                const def  = defModule.default
                hljs.registerLanguage(name, def)
            }))
            .then(() => {
                const seletor = "pre.code-block code"
                document.querySelectorAll(seletor)
                    .forEach(hljs.highlightElement)
            })
            .catch(err => console.error(err))
    }

    if (!languageList.size) {
        // no code blocks
        return
    }
    if (hljs) {
        importLangDefs()
        return
    }

    // import highlight.js itself
    import("../../libs/highlight-es/highlight.min.js")
        .then(module => hljs = module.default)
        .then(importLangDefs)
        .catch(err => console.error(err))
}