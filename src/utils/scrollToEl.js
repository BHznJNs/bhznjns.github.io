export default function(el, offset) {
    const scrollTargetPos = el.offsetTop
    const scrollOffset = -offset
    window.scroll({
        top: scrollTargetPos + scrollOffset,
        behavior: "smooth",
    })
}
