export default function(path, name) {
    const scriptEl = document.createElement("script")
    scriptEl.src   = path
    scriptEl.type  = "text/javascript"
    document.head.appendChild(scriptEl)
    return new Promise((resolve, reject) => {
        scriptEl.onload = () => {
            const localModuleObj = globalThis[name]
            delete globalThis[name]
            resolve(localModuleObj)
        }
        scriptEl.onerror = reject
    })
}
