import { loadErrText, renderErrText } from "./index.js"
import umdLoader from "../umd.js"
import config from "../../../../build.config.js"

let flowchart        = null
globalThis.raphael   = null // dependence for flowchart
const { flowchartOptions } = config
const chartElList    = () => document.querySelectorAll(".flowchart-container")

export default async function() {
    function flowChartRender() {
        for (const el of chartElList()) {
            const chartContent = el.__ChartContent__
            const chartInst = flowchart.parse(chartContent)
            try {
                chartInst.drawSVG(el, flowchartOptions)
            } catch(err) {
                console.error(err)
                el.textContent = renderErrText
            }
        }
    }
    if (flowchart) {
        flowChartRender()
        return
    }

    try {
        globalThis.raphael = await umdLoader("./dist/libs/flowchart.js/raphael.min.js", "raphael")
        flowchart = await umdLoader("./dist/libs/flowchart.js/flowchart.min.js", "flowchart")
    } catch(err) {
        console.error(err)
        chartElList().forEach(el =>
            el.textContent = loadErrText)
    }
    flowChartRender()
}
