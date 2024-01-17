const cacheName = "MarkdownBlog"
const necessaryResources = [
    "./dist/imgs/sun.svg",
    "./dist/imgs/moon.svg",
    "./dist/imgs/rss.svg",
    "./dist/imgs/homepage.svg",
    "./dist/imgs/broken-image.svg",
    "./dist/imgs/fab-switch.svg",
    "./dist/imgs/fab-back-to-top.svg",
    "./dist/imgs/fab-back-to-parent.svg",
    "./dist/imgs/favicon.png",
]
const optionalResources = [
    /\/dist\/libs\//
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
        if (typeof path === "string") {
            const pathURL = new URL(path, currentURL)
            return pathURL.href === url
        } else if (path instanceof RegExp) {
            return path.test(url)
        } else {
            console.error("Unexpected resource path: " + path)
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
