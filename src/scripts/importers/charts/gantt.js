import { loadErrText } from "./index.js"
import importStyle from "../style.js"
import config from "../../../../build.config.js"

let FrappGantt = null
const { language, ganttOptions } = config
const chartElList = () => document.querySelectorAll(".ganttchart-container")

if (!("language" in ganttOptions)) {
    // set language of gantt charts as default
    ganttOptions.language = language
}

export default async function() {
    function ganttChartRenderer() {
        for (const el of chartElList()) {
            const chartContent = el.__ChartContent__
            new FrappGantt(el, chartContent, ganttOptions)
        }
    }

    if (FrappGantt) {
        ganttChartRenderer()
        return
    }

    importStyle("./dist/libs/frappe-gantt/frappe-gantt.min.css")
    import("../../../libs/frappe-gantt/frappe-gantt.min.js")
        .then(module => FrappGantt = module.default)
        .then(ganttChartRenderer)
        .catch(err => {
            console.error(err)
            chartElList().forEach(el =>
                el.textContent = loadErrText)
        })
}
