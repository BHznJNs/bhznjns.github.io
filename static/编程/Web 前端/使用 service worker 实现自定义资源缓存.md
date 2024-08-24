# 使用 Service Worker 实现自定义资源缓存

``2024/02/29``

- - -

Service Worker 往往被与 {PWA}(渐进式 Web 应用) 同时提起，用于在 PWA 中优化应用的离线使用。同时，Service Worker 也可以被独立与 PWA 而单独使用，用来优化 Web 应用中的资源缓存。

## Service Worker 脚本引入

我们先在项目根目录创建名为 ``sw.js`` 的空脚本，在项目的入口文件中加入如下代码：

```javascript
if ("serviceWorker" in navigator) {
    // 如果浏览器支持 Service Worker
    navigator.serviceWorker
        .register("./sw.js")
        .catch(function(error) {
            // Service Worker 注册失败处理
            console.error("Registration failed with " + error);
        })
}
```

这样你就在页面中成功引入了 Service Worker。

> [warning]
> ``navigator.serviceWorker.register`` 函数的第二个参数可选，其中的 ``scope`` 字段定义了站点下该 Service Worker 脚本可访问的文件范围，且默认为 Service Worker 脚本所在的文件夹。
> 例如，你的项目下有一个 ``sw`` 文件夹，其中有一个 ``sw.js`` Service Worker 脚本文件，那么该 Service Worker 默认只能访问该 ``sw`` 文件夹下的文件。
> 同时，如果你指定 ``scope`` 字段为脚本文件的上级目录，会报相关错误，除非你在该脚本的 HTTP Responce 中指定了 ``Service-Worker-Allowed`` 字段。
> 参考：[w3.org:service-worker-allowed](https://www.w3.org/TR/service-workers/#service-worker-allowed)  

## Service Worker 的生命周期

下面是一张简单的图示：

!!!flowchart
st=>start: 页面加载
register=>operation: 注册
install=>operation: 安装
activate=>parallel: 激活
events=>operation: 现在可以触发 Push, Sync 等事件
e=>end: 结束

st->register
register->install
install->activate
activate(path1, right)->events
activate(path2, bottom)->e
!!!

下面是全部的 Service Worker 生命周期事件：
- ``install``
- ``activate``
- ``message``
- Functional events
    - ``fetch``
    - ``sync``
    - ``push``

而本文主要涉及到下面三个事件：
- ``install``: 在 Service Worker 完成安装时以及 Service Worker 完成更新后触发，可以在这里缓存必需且不变的资源。
- ``activate``: 在 Service Worker ``install`` 事件后触发，可以在这里缓存新版本新增的资源以及删除新版本不需要的缓存资源。
- ``fetch``: 在页面发起请求时拦截请求并确定是否使用缓存资源。

下面我们会逐一介绍这三个事件的回调函数实现。

### Install

``install`` 事件会在 Service Worker 注册完成后触发。

```javascript
const cacheName = "..."
const resourcesToCache = [...]

self.addEventListener("install", e => {
    // 使用 `waitUntil` 方法确保在其中的代码执行时，
    // 浏览器不会终止 Service Worker 的运行。
    e.waitUntil(async () => {
        const cache = await caches.open(cacheName)
        console.log("[Service Worker] Caching all: app shell and content")
        // 缓存必需的资源文件
        for (const resource of resourcesToCache) {
            try {
                await cache.add(resource)
            } catch(e) {
                console.log("[Service Worker] Cache error when requesting resource " + resource)
                console.error(e)
            }
        }
    })
})
```

### Activate

``activate`` 事件会在 ``install`` 之后触发。

```javascript
self.addEventListener("activate", e => {
    // 在 Service Worker 更新后更新缓存中的资源文件
    e.waitUntil((async () => {
        // 资源以键值对的方式缓存
        const cache = await caches.open(cacheName)
        // 获取所有已缓存资源的 URL
        const keys = await cache.keys()
        // 获取过期的资源并将其从缓存中删除
        keys.filter(req => !isResourceToCache(req.url))
            .forEach(req => cache.delete(req))
    })())
    console.log("[Service Worker] Activated")
})
```

### Fetch

``fetch`` 事件会在请求资源时读取缓存，对于以缓存的资源，可以将其直接从缓存中返回；对于未缓存的资源，可以在从网络中获取后将其返回。

```javascript
self.addEventListener("fetch", e => {
    async function returnCachedResource(reqURL) {
        const cache = await caches.open(cacheName)
        const cachedResponse = await cache.match(reqURL)

        if (cachedResponse) {
            // 直接返回已缓存的资源
            return cachedResponse
        }

        let fetchResponse
        try {
            // 设置 `fetch` 的 `mode` 字段为 "no-cors" 以
            // 防止 Service Worker 的跨域请求被浏览器拦截
            fetchResponse = await fetch(reqURL, { mode: "no-cors" })
        } catch(err) {
            // 如果 fetch 网络请求失败，返回自定义的 Response
            return new Response("Network error happened: " + err, {
                status: 408,
                headers: { "Content-Type": "text/plain" },
            })
        }
        if (isToCachedResource(reqURL)) {
            // 如果是需要缓存的资源，将其缓存
            cache.put(reqURL, fetchResponse.clone())
        }
        return fetchResponse
    }

    const reqURL = e.request.url
    // 将 Service Worker 的请求结果返回给主进程
    e.respondWith(returnCachedResource(reqURL))
})
```

## 使用 Workbox 简化 Service Worker 开发

你也可以使用现成的 Service Worker 库，如 Google 开源的 [workbox](https://github.com/GoogleChrome/workbox)来大幅简化你的 Service Worker 脚本的开发。
