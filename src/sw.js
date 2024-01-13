const cacheName = "MarkdownBlog"
const appShellFiles = [
    "./katex.min.css",
    "./chunks/katex.min.js",
    "./imgs/sun.svg",
    "./imgs/moon.svg",
    "./imgs/rss.svg",
    "./imgs/homepage.svg",
    "./imgs/broken.svg",
    "./imgs/favicon.png",
    "./fonts/KaTeX_Math-Italic.woff2",
    "./fonts/KaTeX_Main-Regular.woff2",
    "./fonts/KaTeX_Size4-Regular.woff2",
    "./fonts/KaTeX_Size1-Regular.woff2",
    "./fonts/KaTeX_AMS-Regular.woff2",
]

self.addEventListener("install", (e) => {
    console.log("[Service Worker] Installing...")
    e.waitUntil((async () => {
        const cache = await caches.open(cacheName)
        console.log("[Service Worker] Caching all: app shell and content")
        for (const resource of appShellFiles) {
            try {
                await cache.add(resource)
            } catch(e) {
                console.log("[Service Worker] Cache error when requesting resource " + resource)
                console.error(e)
            }
        }
    })())
})
self.addEventListener("activate", (_) => {
    console.log("[Service Worker] Activated")
})

// block part of fetch operation
self.addEventListener("fetch", (e) => {
    const target = e.request
    if (caches.match(target)) {
        e.respondWith(caches.match(target))
        console.log(`[Service Worker] Used cached ${target.url} to response request`)
    } else {
        e.respondWith(fetch(target))
        console.log(`[Service Worker] Fetching ${target.url}`)
    }
})
