export default function(el) {
    return function(e) {
        if (e.key == "Enter" || e.key == " ") {
            el.click()
        }
    }
}