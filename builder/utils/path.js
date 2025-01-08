export const staticPath = "static/"
export const indexFilePath = ".index/"
export const rssFilePath = "rss.xml"
export const ssrResourcePath = ".ssr/"
export const ssrCachePath = ".ssr/cache.json"
export const indexHTMLPath = "index.html"
export const countHTMLPath = "count.html"
export const backupFilePath = "user/backup.json"
export const robotsTxtPath = "robots.txt"
export const sitemapPath = "sitemap.xml"

export function normalizePath(filePath) {
    return filePath.replace(/\\/g, "/")
}
