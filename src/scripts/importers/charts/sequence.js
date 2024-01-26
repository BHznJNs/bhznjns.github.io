import { loadErrText, renderErrText } from "./index.js"

let SequenceDiagram = null
const chartElList = () => document.querySelectorAll(".sequencechart-container")

export default async function() {
    function renderItem(el) {
        const chartContent = el.__ChartContent__
        const diagram = new SequenceDiagram(chartContent)
        el.appendChild(diagram.dom())
    }
    function sequenceChartRenderer() {
        for (const el of chartElList()) {
            try {
                renderItem(el)
            } catch(err) {
                console.error(err)
                el.textContent = renderErrText
            }
        }
    }


    if (SequenceDiagram) {
        sequenceChartRenderer()
        return
    }

    import("../../../libs/sequence-diagram/sequence-diagram-web.mjs")
        .then(module => SequenceDiagram = module.SequenceDiagram)
        .then(sequenceChartRenderer)
        .catch(err => {
            console.error(err)
            chartElList().forEach(el =>
                el.textContent = loadErrText)
        })
}
