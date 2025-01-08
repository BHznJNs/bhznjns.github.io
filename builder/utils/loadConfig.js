const configPath = "../../user/build.config.js"
/** @type {import("../../user/build.config").SiteConfig} */
export const config = (await import(configPath)).default
