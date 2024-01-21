import terser from "@rollup/plugin-terser"
import dynamicImportVariables from "@rollup/plugin-dynamic-import-vars"
import copy from "rollup-plugin-copy"
import postcss from "rollup-plugin-postcss"
import cssImport from "postcss-import"
import autoprefixer from "autoprefixer"
import cssnanoPlugin from "cssnano"

function componentStyleResolver(componentName) {
    return postcss({
        include: [`src/styles/components/${componentName}.css`],
        extract: `chunks/${componentName}.min.css`,
        plugins: [
            cssImport(),
            autoprefixer(),
            cssnanoPlugin(),
        ],
    })
}

export default [
    {
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
            componentStyleResolver("fab"),
            componentStyleResolver("catalog"),
            postcss({
                include: [
                    "src/styles/*.css",
                    "src/libs/highlight-es/*.css",
                    "src/styles/components/paging.css",
                ],
                extract: "style.min.css",
                plugins: [
                    cssImport(),
                    autoprefixer(),
                    cssnanoPlugin(),
                ],
            }),
            dynamicImportVariables(),
        ]
    },
    {
        input: "src/sw.js",
        output: {
            file: "sw.js",
            format: "es",
            sourcemap: "hidden",
            sourcemapFileNames: "dist/sw.js.map",
        },
        plugins: [
            terser(),
            {   // customized plugin
                name: "sourcemap-path appender",
                renderChunk(code) {
                    const sourcemapPath = "./dist/sw.js.map"
                    code += "\n//# sourceMappingURL=" + sourcemapPath
                    return { code, map: null }
                }
            }
        ]
    }
]
