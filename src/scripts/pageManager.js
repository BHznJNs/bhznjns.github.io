class PageManager {
    #pageList = [1]

    current() {
        const length = this.#pageList.length
        return this.#pageList[length - 1]
    }
    next() {
        const length = this.#pageList.length
        this.#pageList[length - 1] += 1
    }
    previous() {
        const length = this.#pageList.length
        this.#pageList[length - 1] -= 1
    }

    back() {
        // called when "popstate" emited
        this.#pageList.pop()
        if (!this.#pageList.length) {
            this.#pageList.push(1)
        }
    }
    open() {
        // called when enter directory
        this.#pageList.push(1)
    }
}
export default new PageManager()
