/** @type {import("../../user/build.config").SiteConfig} */
const config = (await import("../../user/build.config.js")).default

try {
    new URL(config.homepage)
} catch {
    console.log("Invalid homepage URL: ", config.homepage)
    process.exit(1)
}

export { config }
