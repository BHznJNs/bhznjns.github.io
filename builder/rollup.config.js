import terser from "@rollup/plugin-terser"
import postcss from "rollup-plugin-postcss"
import autoprefixer from "autoprefixer"
import cssnanoPlugin from "cssnano"

export default {
    input: "src/index.js",
    output: {
        file: "dist/index.min.js",
        format: "es"
    },
    plugins: [
        terser(),
        postcss({
            plugins: [
               autoprefixer(),
               cssnanoPlugin()
            ],
            extract: "style.min.css"
        })
    ]
}
