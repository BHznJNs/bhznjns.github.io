export const staticPath = "static/"
export const indexFilePath = ".index/"
export const rssFilePath = "user/rss.xml"
export const ssrResourcePath = ".ssr/"
export const ssrCachePath = ".ssr/cache.json"
export const ssrListPath  = ".ssr/index.html"
export const homepagePath = "index.html"
export const countPagePath = "user/count.html"
export const backupFilePath = "user/backup.json"

export function normalizePath(filePath) {
    return filePath.replace(/\\/g, "/")
}
