import { loadErrText, renderErrText } from "./index.js"
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
    function ganttChartRender() {
        for (const el of chartElList()) {
            const chartContent = el.__ChartContent__
            try {
                new FrappGantt(el, chartContent, ganttOptions)
            } catch(err) {
                console.error(err)
                el.textContent = renderErrText
            }
        }
    }

    if (FrappGantt) {
        ganttChartRender()
        return
    }

    importStyle("./dist/libs/frappe-gantt/frappe-gantt.min.css")
    import("../../../libs/frappe-gantt/frappe-gantt.min.js")
        .then(module => FrappGantt = module.default)
        .then(ganttChartRender)
        .catch(err => {
            console.error(err)
            chartElList().forEach(el =>
                el.textContent = loadErrText)
        })
}
