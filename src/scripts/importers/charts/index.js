import echartsRender from "./echarts.js"
import flowchartRender from "./flowchart.js"
import sequenceChartRender from "./sequence.js"
import ganttChartRender from "./gantt.js"
import railroadChartRender from "./railroad.js"

const chartMethodMap = new Map([
    ["echarts"       , echartsRender],
    ["flow-chart"    , flowchartRender],
    ["sequence-chart", sequenceChartRender],
    ["gantt-chart"   , ganttChartRender],
    ["railroad-chart", railroadChartRender],
])

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
