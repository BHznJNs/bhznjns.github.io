import terser from "@rollup/plugin-terser"
import dynamicImportVars from '@rollup/plugin-dynamic-import-vars';
import postcss from "rollup-plugin-postcss"
import autoprefixer from "autoprefixer"
import cssnanoPlugin from "cssnano"

export default {
    input: "src/index.js",
    output: {
        dir: "dist/",
        format: "es",
        entryFileNames: "index.min.js",
        chunkFileNames: "chunks/[name].min.js",
    },
    plugins: [
        terser(),
        postcss({
            plugins: [
               autoprefixer(),
               cssnanoPlugin()
            ],
            extract: "style.min.css"
        }),
        dynamicImportVars(),
    ]
}
