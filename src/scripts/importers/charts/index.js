import importEcharts from "./echarts.js"
import importFlowchart from "./flowchart.js"
import importSequenceChart from "./sequence.js"
import importGantt from "./gantt.js"
import importRailroad from "./railroad.js"
import languageSelector from "../../../utils/languageSelector.js"

const chartMethodMap = new Map([
    ["echarts"       , importEcharts],
    ["flow-chart"    , importFlowchart],
    ["sequence-chart", importSequenceChart],
    ["gantt-chart"   , importGantt],
    ["railroad-chart", importRailroad],
])

export const loadErrText   = languageSelector("图表加载失败", "Chart load error")
export const renderErrText = languageSelector("图表渲染失败", "Chart render error")

export default async function(chartTypeList=new Set()) {
    for (const type of chartTypeList) {
        if (!chartMethodMap.has(type)) {
            console.error("Unknown chart type: " + type)
            continue
        }
        const targetChartLoadMethod = chartMethodMap.get(type)
        await targetChartLoadMethod()
    }
}
