function isOnPreviewServer() {
    const hostname = location.hostname
    return hostname === "localhost"
        || hostname === "127.0.0.1"
        || hostname.startsWith("192.168.")
}

export class LiveReloadWSClient {
    ws = null
    wsServerURL   = "ws://" + location.host
    isConnected   = false
    retryCount    = 0
    retryInterval = LiveReloadWSClient.defaultRetryInterval

    connect() {
        if (!LiveReloadWSClient.isAbleToConnect) {
            return
        }
        this.ws = new WebSocket(this.wsServerURL)
        this.ws.addEventListener("open", () => {
            this.retryCount  = 0
            this.retryInterval = LiveReloadWSClient.defaultRetryInterval
            this.isConnected = true
            console.log("LiveReload WebSocket connected.")
        })
        this.ws.addEventListener("message", event => {
            if (event.data === "refresh") {
                location.reload()
            }
        })
        this.ws.addEventListener("error", event => {
            console.error("LiveReload WebSocket error occurred:", event)
            this.isConnected = false
            this.reconnect()
        })
        this.ws.addEventListener("close", () => {
            console.warn("LiveReload WebSocket connection closed.")
            this.isConnected = false
            this.reconnect()
        })
    }
    reconnect() {
        if (this.isConnected) {
            return
        }
        // increase retry interval by disconnected duration
        if (this.retryCount > 10 && this.retryCount <= 20) {
            this.retryInterval = 2 * LiveReloadWSClient.defaultRetryInterval
        } else if (this.retryCount > 20) {
            this.retryInterval = 4 * LiveReloadWSClient.defaultRetryInterval
        } else {
            this.retryInterval = LiveReloadWSClient.defaultRetryInterval
        }

        // try to reconnect every 1 second
        setTimeout(() => {
            this.retryCount += 1
            this.connect()
        }, this.retryInterval)
    }

    static isAbleToConnect = isOnPreviewServer() && ("WebSocket" in window)
    static defaultRetryInterval = 1000
}
