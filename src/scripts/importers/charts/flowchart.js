import ChartImporter from "./importer.js"
import umdLoader from "../umd.js"
import config from "../../../../build.config.js"

globalThis.raphael = null
const { flowchartOptions } = config

class FlowchartImporter extends ChartImporter {
    _targetElList = () => document.querySelectorAll(".flowchart-container")

    constructor() { super() }

    renderItem(el, chartContent) {
        const chartInst = this._module.parse(chartContent)
        chartInst.drawSVG(el, flowchartOptions)
    }

    async importModule() {
        globalThis.raphael = await umdLoader("./dist/libs/flowchart.js/raphael.min.js", "raphael")
        const flowchartModule = await umdLoader("./dist/libs/flowchart.js/flowchart.min.js", "flowchart")
        return flowchartModule
    }
}

const inst = new FlowchartImporter()
export default inst.render.bind(inst)
