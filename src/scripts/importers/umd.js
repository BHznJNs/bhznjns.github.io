export default function(path, name) {
    const scriptEl = document.createElement("script")
    scriptEl.src   = path
    scriptEl.type  = "text/javascript"
    document.head.appendChild(scriptEl)
    return new Promise((resolve, reject) => {
        scriptEl.onload = function() {
            const localModuleObj = globalThis[name]
            delete globalThis[name]
            resolve(localModuleObj)
        }
        scriptEl.onerror = function(err) {
            console.error(`Error loading dynamically imported module "${name}": ${path}`)
            reject(err)
        }
    })
}
