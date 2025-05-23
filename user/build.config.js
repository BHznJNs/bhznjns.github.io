/** @type {import("basb-cli/types").SiteConfig} */
export default {
    homepage: "https://bhznjns.github.io/",
    title: "BHznJNs' Blog",
    description: "我是 BHznJNs，这是我的博客，也是我的第二大脑。",
    footer: `::[字数统计](//user/count.html) | [静态目录](//pages/) | Powered by [BaSB](https://github.com/BHznJNs/BaSB)::`,
    language: "zh",
    pageSize: 20,

    preview: {
        port: 3030,
        liveReload: true,
    },

    catalog: {
        enable: true
    },
    fab: {
        enable: true,
        buttons: [
            "catalogSwitcher",
            "downsizeText",
            "enlargeText",
            "backToParent",
            "backToTop",
        ],
    },
    rss: {
        enable: true,
        size: 50,
        extraMetadata: `\
<follow_challenge>
    <feedId>101282540872310784</feedId>
    <userId>96180252670732288</userId>
</follow_challenge>`,
    },
    newest: {
        enable: true,
        pageSize: 40,
    },
    search: {
        enable: true,
        pageThreshold: 30000
    },

    extraMetadata: [
        {
            name: "google-site-verification",
            content: "ElMW-j35zgO3DvJAbuU9gQHdwKF4f6Xf0u7nUVAhiyw"
        },
        {
            name: "msvalidate.01",
            content: "D238928E66FF020B87E0798FE763EC54"
        }
    ],
    extraScripts: [
        "https://www.googletagmanager.com/gtag/js?id=G-NV45LQLRQW",
        "./user/external.js",
    ],

    katexOptions: {},
    echartsOptions: {
        tooltip: {
            show: true,
            backgroundColor: "rgb(255,255,255,.9)"
        }
    },
    flowchartOptions: {},
    ganttOptions: {},
    railroadOptions: {},

    qrcodeOptions: {
        content: "https://bhznjns.github.io/", // default content for all qrcodes
        padding: 4, // white space padding, 4 modules by default, 0 for no border
        width: 256, // QR Code width in pixels
        height: 256, // QR Code height in pixels
    }
}
