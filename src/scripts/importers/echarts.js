import debounce from "../../utils/debounce.js"
import eventbus from "../../utils/eventbus/inst.js"
import languageSelector from "../../utils/languageSelector.js"
import config from "../../../build.config.js"

const globalOptions = config.echartsOptions

let echarts = null
let importChart = null
let importComponent = null

const chartElList = () => document.querySelectorAll(".chart")

const darkmodeObserver = new MutationObserver(_ => {
    for (const el of chartElList()) {
        // rerender all chart elements to reset color theme
        echarts.dispose(el)
        chartRenderer(el)
    }
})

const resizeEvent = () => chartElList()
    .forEach(el => echarts.getInstanceByDom(el).resize())

function chartRenderer(el) {
    const isDarkMode = document.body.classList.contains("dark")
    const renderMode = isDarkMode ? "dark" : "light"
    const chartInst = echarts.init(el, renderMode)

    // options merging
    const currentOptions = el.__ChartOptions__
    const globalOptionsCloned = Object.assign({}, globalOptions)
    const finalOptions = Object.assign(globalOptionsCloned, currentOptions)
    chartInst.setOption(finalOptions)
}

function chartOptionResolver(options={}, libsToImport) {
    const ignoredProps = [
        "color",
        "backgroundColor",
        "darkMode",
        "textStyle",
        "aria",
        "axisPointer",
        "animation",
        "animationThreshold",
        "animationDuration",
        "animationEasing",
        "animationDelay",
        "animationDurationUpdate",
        "animationEasingUpdate",
        "animationDelayUpdate",
        "stateAnimation",
        "blendMode",
        "hoverLayerThreshold",
        "options",
        "useUTC",
        "media",
    ]

    for (const key in options) {
        if (ignoredProps.includes(key)) {
            continue
        }
        if (key === "series") {
            for (const item of options.series) {
                if (!("type" in item)) {
                    continue
                }
                libsToImport.charts.add(item.type)
            }
            continue
        }

        switch (key) {
            case "xAxis":
            case "yAxis":
                libsToImport.components.add("grid")
                continue
            case "radiusAxis":
            case "angleAxis":
                libsToImport.components.add("polar")
                continue
            case "parallelAxis":
                libsToImport.components.add("parallel")
                continue
        }
        libsToImport.components.add(key)
    }
}

export default async function(chartOptions) {
    function loadError(err) {
        const loadErrText = languageSelector("图表加载失败", "Chart load error")
        console.error(err)
        chartElList().forEach(el =>
            el.textContent = loadErrText)
    }
    function importChartLibs() {
        const libsToImport = {
            charts: new Set(),
            components: new Set(),
        }
        chartOptionResolver(globalOptions, libsToImport)
        chartOptions.forEach(options =>
            chartOptionResolver(options, libsToImport))

        const chartsToImport = Array.from(libsToImport.charts).map(importChart)
        const componentsToImport = Array.from(libsToImport.components).map(importComponent)
        Promise.all(chartsToImport.concat(componentsToImport))
            .then(echartsLibs => {
                echarts.use(echartsLibs)
                chartElList().forEach(chartRenderer)
            })
            .catch(loadError)
    }

    if (!chartOptions.length) {
        // no chart
        return
    }
    if (echarts) {
        importChartLibs()
        return
    }
    import("../../libs/echarts/core.js")
        .then(module => {
            echarts         = module.default
            importChart     = module.importChart
            importComponent = module.importComponent
        })
        .then(importChartLibs)
        .then(() => {
            const body = document.body
            darkmodeObserver.observe(body, {
                attributes: true,
                attributeFilter: ["class"]
            })

            // resize event listeners
            eventbus.on("catalog-toggle", resizeEvent)
            window.addEventListener("resize",
                debounce(resizeEvent, 200))
        })
        .catch(loadError)
}