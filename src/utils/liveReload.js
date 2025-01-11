function isOnPreviewServer() {
    const hostname = location.hostname
    return hostname === "localhost"
        || hostname === "127.0.0.1"
        || hostname.startsWith("192.168.")
}

export class LiveReloadWSClient {
    wsServerURL = "ws://" + location.host
    isConnected = false

    connect() {
        if (!LiveReloadWSClient.isAbleToConnect) {
            return
        }
        const ws = new WebSocket(this.wsServerURL)
        ws.addEventListener("open", () =>
            this.isConnected = true)
        ws.addEventListener("message", event => {
            if (event.data === "refresh") {
                location.reload()
            }
        })
        ws.addEventListener("error", event => {
            console.error("LiveReload WebSocket error occurred:", event)
            this.isConnected = false
            this.reconnect()
        })
        ws.addEventListener("close", () => {
            console.warn("LiveReload WebSocket connection closed.")
            this.isConnected = false
            this.reconnect()
        })
    }
    reconnect() {
        if (this.isConnected) {
            return
        }
        // try to reconnect every 1 second
        setTimeout(() => {
            this.connect()
        }, 1000)
    }

    static isAbleToConnect = isOnPreviewServer() && ("WebSocket" in window)
}
