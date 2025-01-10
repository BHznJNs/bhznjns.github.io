export const staticPath = "static/"
export const indexFilePath = ".index/"
export const rssFilePath = "user/rss.xml"
export const ssrResourcePath = ".ssr/"
export const ssrCachePath = ".ssr/cache.json"
export const ssrListPath  = ".ssr/ssr-list.html"
export const indexHTMLPath = "index.html"
export const countHTMLPath = "user/count.html"
export const backupFilePath = "user/backup.json"

export function normalizePath(filePath) {
    return filePath.replace(/\\/g, "/")
}
