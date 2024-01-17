import terser from "@rollup/plugin-terser"
import copy from "rollup-plugin-copy"
import postcss from "rollup-plugin-postcss"
import cssImport from "postcss-import"
import autoprefixer from "autoprefixer"
import cssnanoPlugin from "cssnano"

export default [{
    input: "src/index.js",
    output: {
        dir: "dist/",
        format: "es",
        entryFileNames: "index.min.js",
        chunkFileNames: "chunks/[name].min.js",
        sourcemap: true,
    },
    external: [/katex/, /highlight/],
    plugins: [
        terser(),
        copy({
            targets: [
                { /* images */
                    src: [
                        "src/imgs/*.svg",
                        "src/imgs/*.jpg",
                        "src/imgs/*.png",
                    ],
                    dest: "dist/imgs/"
                },
                { /* katex script */
                    src: [
                        "src/libs/katex/*.min.*",
                        "src/libs/katex/katex.map"
                    ],
                    dest: "dist/libs/katex/"
                },
                { /* katex fonts */
                    src: "src/libs/katex/fonts/*",
                    dest: "dist/libs/katex/fonts/",
                },
                {/* highlight.js */
                    src: [
                        "src/libs/highlight-es/highlight.min.js",
                        "src/libs/highlight-es/highlight.map",
                    ],
                    dest: "dist/libs/highlight-es/"
                },
                {/* highlight.js languages */
                    src: "src/libs/highlight-es/languages/*",
                    dest: "dist/libs/highlight-es/languages/"
                }
            ],
        }),
        postcss({
            include: [
                "src/styles/*.css",
                "src/libs/highlight-es/*.css"
            ],
            extract: "style.min.css",
            plugins: [
                cssImport(),
                autoprefixer(),
                cssnanoPlugin(),
            ],
        }),
    ]
}, {
    input: "src/sw.js",
    output: {
        file: "sw.js",
        format: "es",
        sourcemap: "hidden",
        sourcemapFileNames: "dist/sw.map",
    },
    plugins: [
        terser(),
        {   // customized plugin
            name: "sourcemap-path appender",
            renderChunk(code) {
                const sourcemapPath = "./dist/sw.map"
                code += "\n//# sourceMappingURL=" + sourcemapPath
                return { code, map: null }
            }
        }
    ]
}]
