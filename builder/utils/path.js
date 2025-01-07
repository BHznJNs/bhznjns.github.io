export const staticPath = "static/"
export const indexFilePath = ".index/"
export const rssFilePath = "rss.xml"
export const ssrResourcePath = ".ssr/"
export const ssrCachePath = ".ssr/cache.json"
export const indexHTMLPath = "index.html"
export const countHTMLPath = "count.html"
export const backupFilePath = "backup.json"

export function normalizePath(filePath) {
    return filePath.replace(/\\/g, "/")
}
