export default async function() {
    if (!("WebSocket" in window)) {
        return
    }
    const wsServerURL = "ws://" + location.host
    const ws = new WebSocket(wsServerURL)
    ws.addEventListener("message", event => {
        if (event.data === "refresh") {
            location.reload()
        }
    })
}
