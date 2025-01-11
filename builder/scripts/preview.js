import os from "node:os"
import http from "node:http"
import { WebSocketServer } from "ws"
import express from "express"
import startWatch from "./watch.js"
import { config } from "../utils/loadConfig.js"

function getLANIpAddress() {
    const ifaces = os.networkInterfaces()
    let lanIP = null

    for (const [name, interfaces] of Object.entries(ifaces)) {
        if (name.includes("*") || !Array.isArray(interfaces)) {
            continue
        }
        for (const iface of interfaces) {
            if (iface.family !== "IPv4" ||
                iface.internal ||
                iface.address === "127.0.0.1"
            ) { continue }
            if (/wlan|wifi|wireless/i.test(name)) {
                // the IP of WLAN is prefered
                return iface.address
            }
            lanIP = iface.address
        }
    }
    return lanIP || "Unable to determine LAN IP"
}

const { port, liveReload } = config.preview

const app = express()
const server = http.createServer(app)
app.use("/preview", express.static("./"))

// --- LiveReload WebSocket server start ---
/** @type {WebSocket | null} */
let websocket = null
if (liveReload) {
    const wss = new WebSocketServer({ server })
    wss.on("listening",  () => console.log("Live server listening on port:", port))
    wss.on("connection", ws => websocket = ws)
    wss.on("close",      () => websocket = null)
}
// --- LiveReload WebSocket server end ---

startWatch(() => {
    websocket && websocket.send("refresh")
})

const LAN_IP = getLANIpAddress()
server.listen(port, "0.0.0.0", () => {
    // listen in both LAN and localhost
    if (LAN_IP) {
        console.log(`Listening: http://${LAN_IP}:${port}/preview/`)
    }
    console.log(`Listening: http://localhost:${port}/preview/`)
})
