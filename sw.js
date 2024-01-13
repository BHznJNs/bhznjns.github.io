const cacheName = "MarkdownBlog"
const necessaryResources = [
    "./dist/imgs/sun.svg",
    "./dist/imgs/moon.svg",
    "./dist/imgs/rss.svg",
    "./dist/imgs/homepage.svg",
    "./dist/imgs/broken-image.svg",
    "./dist/imgs/favicon.png",
]
const optionalResources = [
    "./dist/katex.min.css",
    "./dist/chunks/katex.min.js",
    "./dist/chunks/highlight.min.js",
    // formula fonts
    "./dist/fonts/KaTeX_AMS-Regular.woff2",
    "./dist/fonts/KaTeX_AMS-Regular.woff",
    "./dist/fonts/KaTeX_AMS-Regular.ttf",
    "./dist/fonts/KaTeX_Caligraphic-Bold.woff2",
    "./dist/fonts/KaTeX_Caligraphic-Bold.woff",
    "./dist/fonts/KaTeX_Caligraphic-Bold.ttf",
    "./dist/fonts/KaTeX_Caligraphic-Regular.woff2",
    "./dist/fonts/KaTeX_Caligraphic-Regular.woff",
    "./dist/fonts/KaTeX_Caligraphic-Regular.ttf",
    "./dist/fonts/KaTeX_Fraktur-Bold.woff2",
    "./dist/fonts/KaTeX_Fraktur-Bold.woff",
    "./dist/fonts/KaTeX_Fraktur-Bold.ttf",
    "./dist/fonts/KaTeX_Fraktur-Regular.woff2",
    "./dist/fonts/KaTeX_Fraktur-Regular.woff",
    "./dist/fonts/KaTeX_Fraktur-Regular.ttf",
    "./dist/fonts/KaTeX_Main-Bold.woff2",
    "./dist/fonts/KaTeX_Main-Bold.woff",
    "./dist/fonts/KaTeX_Main-Bold.ttf",
    "./dist/fonts/KaTeX_Main-BoldItalic.woff2",
    "./dist/fonts/KaTeX_Main-BoldItalic.woff",
    "./dist/fonts/KaTeX_Main-BoldItalic.ttf",
    "./dist/fonts/KaTeX_Main-Italic.woff2",
    "./dist/fonts/KaTeX_Main-Italic.woff",
    "./dist/fonts/KaTeX_Main-Italic.ttf",
    "./dist/fonts/KaTeX_Main-Regular.woff2",
    "./dist/fonts/KaTeX_Main-Regular.woff",
    "./dist/fonts/KaTeX_Main-Regular.ttf",
    "./dist/fonts/KaTeX_Math-BoldItalic.woff2",
    "./dist/fonts/KaTeX_Math-BoldItalic.woff",
    "./dist/fonts/KaTeX_Math-BoldItalic.ttf",
    "./dist/fonts/KaTeX_Math-Italic.woff2",
    "./dist/fonts/KaTeX_Math-Italic.woff",
    "./dist/fonts/KaTeX_Math-Italic.ttf",
    "./dist/fonts/KaTeX_SansSerif-Bold.woff2",
    "./dist/fonts/KaTeX_SansSerif-Bold.woff",
    "./dist/fonts/KaTeX_SansSerif-Bold.ttf",
    "./dist/fonts/KaTeX_SansSerif-Italic.woff2",
    "./dist/fonts/KaTeX_SansSerif-Italic.woff",
    "./dist/fonts/KaTeX_SansSerif-Italic.ttf",
    "./dist/fonts/KaTeX_SansSerif-Regular.woff2",
    "./dist/fonts/KaTeX_SansSerif-Regular.woff",
    "./dist/fonts/KaTeX_SansSerif-Regular.ttf",
    "./dist/fonts/KaTeX_Script-Regular.woff2",
    "./dist/fonts/KaTeX_Script-Regular.woff",
    "./dist/fonts/KaTeX_Script-Regular.ttf",
    "./dist/fonts/KaTeX_Size1-Regular.woff2",
    "./dist/fonts/KaTeX_Size1-Regular.woff",
    "./dist/fonts/KaTeX_Size1-Regular.ttf",
    "./dist/fonts/KaTeX_Size2-Regular.woff2",
    "./dist/fonts/KaTeX_Size2-Regular.woff",
    "./dist/fonts/KaTeX_Size2-Regular.ttf",
    "./dist/fonts/KaTeX_Size3-Regular.woff2",
    "./dist/fonts/KaTeX_Size3-Regular.woff",
    "./dist/fonts/KaTeX_Size3-Regular.ttf",
    "./dist/fonts/KaTeX_Size4-Regular.woff2",
    "./dist/fonts/KaTeX_Size4-Regular.woff",
    "./dist/fonts/KaTeX_Size4-Regular.ttf",
    "./dist/fonts/KaTeX_Typewriter-Regular.woff2",
    "./dist/fonts/KaTeX_Typewriter-Regular.woff",
    "./dist/fonts/KaTeX_Typewriter-Regular.ttf",
]

// get the page URL without hash
function getCleanURL() {
    const href = location.href
    const hashIndex = href.indexOf('#')
    if (hashIndex !== -1) {
        href = href.substring(0, hashIndex)
    }
    return href
}

// check if the input URL is in the necessary
function isResourceToCache(url, type) {
    const resources = type === "option" 
        ? optionalResources
        : necessaryResources
    const currentURL = getCleanURL()
    for (const path of resources) {
        const pathURL = new URL(path, currentURL)
        if (pathURL.href == url) {
            return true
        }
    }
    return false
}

self.addEventListener("install", (e) => {
    console.log("[Service Worker] Installing...")
    e.waitUntil((async () => {
        const cache = await caches.open(cacheName)
        console.log("[Service Worker] Caching all: app shell and content")
        // cache necessary resources
        for (const resource of necessaryResources) {
            try {
                await cache.add(resource)
            } catch(e) {
                console.log("[Service Worker] Cache error when requesting resource " + resource)
                console.error(e)
            }
        }
    })())
})

self.addEventListener("activate", (e) => {
    e.waitUntil((async () => {
        // auto update cache when this file updated
        const cache = await caches.open(cacheName)
        const keys = await cache.keys()
        keys.filter(req =>
            !isResourceToCache(req.url, "necessary") &&
            !isResourceToCache(req.url, "necessary"))
        .forEach(req => cache.delete(req))
    })())
    console.log("[Service Worker] Activated")
})

// intercepting fetch operations
self.addEventListener("fetch", (e) => {
    async function returnCachedResource() {
        const cache = await caches.open(cacheName)
        const cachedResponse = await cache.match(e.request.url)

        if (cachedResponse) {
            // return cached resources directly
            return cachedResponse
        } else {
            // fetch not cached resources and return
            const fetchResponse = await fetch(e.request.url)
            if (isResourceToCache(e.request.url, "option")) {
                // cache optional resources
                cache.put(e.request.url, fetchResponse.clone())
            }
            return fetchResponse
        }
    }
    e.respondWith(returnCachedResource())
})
