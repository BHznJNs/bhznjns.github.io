import importStyle from "./style.js"

export default async function(name) {
    await import(`../../components/${name}.js`)
    importStyle(`./dist/chunks/${name}.min.css`)
}
