const maximum = 8

const defaultButton = (i) => `<button>${i}</button>`
const strongButton = (i) => `<button><strong>${i}</strong></button>`

class Pages extends HTMLElement {
    constructor() {
        super()
    }
    connectedCallback() {
        this.innerHTML = "<span id='page-info'></span><span id='pages'></span>"
        this.pageButtons = this.querySelector("#pages")
        this.pageInfo = this.querySelector("#page-info")
    }

    setter(current, total) {
        this.style.display = (total == 1) ? "none" : "flex"

        let index = 1
        let resultHTML = ""

        let intervalStart
        let intervalEnd
        if (total <= maximum) {
            intervalStart = 1
            intervalEnd = total
        } else {
            if (total - current <= maximum) {
                intervalStart = total - maximum
                intervalEnd = total
            } else
            if (current <= maximum) {
                intervalStart = 1
                intervalEnd = maximum
            } else {
                intervalStart = current - (maximum / 2)
                intervalEnd = current + (maximum / 2)
            }
        }
        for (let i=intervalStart; i<=intervalEnd; i++) {
            const button = (i == current) ? strongButton(i) : defaultButton(i)
            resultHTML += button
        }

        this.pageButtons.innerHTML = resultHTML
        this.pageInfo.innerHTML = `${current}/${total} 页`
    }
}

customElements.define("page-indexing", Pages)