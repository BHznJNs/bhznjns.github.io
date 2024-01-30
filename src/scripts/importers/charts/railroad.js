import { loadErrText, renderErrText } from "./index.js"
import importStyle from "../style.js"

let moduleConstants = null
const chartElList = () => document.querySelectorAll(".railroad-container")

export default async function() {
    function itemRender(el, chartContent) {
        const renderArgs = moduleConstants.concat(el)
        const renderFn = new Function(
            "Diagram",
            "ComplexDiagram",
            "Sequence",
            "Stack",
            "OptionalSequence",
            "AlternatingSequence",
            "Choice",
            "HorizontalChoice",
            "MultipleChoice",
            "Optional",
            "OneOrMore",
            "ZeroOrMore",
            "Group",
            "Start",
            "End",
            "Terminal",
            "NonTerminal",
            "Comment",
            "Skip",
            "Block",
            "targetElement",
            chartContent + ".addTo(targetElement)",
        )
        renderFn.apply(null, renderArgs)
    }
    function railroadRender() {
        for (const el of chartElList()) {
            try {
                itemRender(el, el.__ChartContent__)
            } catch(err) {
                console.error(err)
                el.textContent = renderErrText
            }
        }
    }

    if (moduleConstants) {
        railroadRender()
        return
    }

    importStyle("./dist/libs/railroad-diagrams/railroad.css")
    import("../../../libs/railroad-diagrams/railroad.min.js")
        .then(module => {
            const rr = module.default
            moduleConstants = [
                rr.Diagram,
                rr.ComplexDiagram,
                rr.Sequence,
                rr.Stack,
                rr.OptionalSequence,
                rr.AlternatingSequence,
                rr.Choice,
                rr.HorizontalChoice,
                rr.MultipleChoice,
                rr.Optional,
                rr.OneOrMore,
                rr.ZeroOrMore,
                rr.Group,
                rr.Start,
                rr.End,
                rr.Terminal,
                rr.NonTerminal,
                rr.Comment,
                rr.Skip,
                rr.Block,
            ]
        })
        .then(railroadRender)
        .catch(err => {
            console.error(err)
            chartElList().forEach(el =>
                el.textContent = loadErrText)
        })
}
