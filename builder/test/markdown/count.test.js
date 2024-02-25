import assert from "node:assert/strict"
import { checkType } from "../util.js"
import countWord from "../../../src/utils/countWord.js"

describe("Paragraph word counter", () => {
    it("should be a function", () => {
        assert.ok(checkType(countWord, Function))
    })

    it("should count Chinese words", () => {
        assert.equal(countWord("你好 你好"), 4)
    })

    it("should count English words", () => {
        assert.equal(countWord("two words"), 2)
    })
    it("should count European language words", () => {
        assert.equal(countWord("ÀÁÂÃá ÇÈÌñÐ ÙÝüàá æë¿¡ð"), 4)
    })
    it("should count Greek characters", () => {
        assert.equal(countWord("αβ Ση δΔ ΑΒ"), 4)
    })
    it("should count Cyrillic characters", () => {
        assert.equal(countWord("Аа Њњ Ҕҕ Шш"), 4)
    })
    it("should count Arabic characters", () => {
        assert.equal(countWord("بت ﺙث ﺚﺜ ﺛﺟ"), 4)
    })

    it("should count numbers", () => {
        assert.equal(countWord("123 -123 1.23 -1.23 .23"), 5)
    })

    it("should ignore symbols", () => {
        assert.equal(countWord(" ,.;'/[]\\!@#$%^&*()-=_+《》，。、；‘：“「」『』、·——=！%……*（）"), 0)
    })
})