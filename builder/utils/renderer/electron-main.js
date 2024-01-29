import electron from "electron"

const { app, BrowserWindow, ipcMain } = electron

let win;
const createWindow = () => {
    win = new BrowserWindow({
        width: 1000,
        height: 800,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    })
    process.send({ msg: "window-ready" })
}
const loadPage = pagename => {
    win.loadFile(pagename + ".html")
    win.webContents.on("did-finish-load", () => {
        process.send({ msg: "page-ready" })
    })
}

app.whenReady().then(createWindow)
app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

ipcMain.on("render-ended", (_event) => {
    process.send({ msg: "render-ended" })
})
ipcMain.on("render-error", (_event, errMsg) => {
    process.send({
        msg: "render-error",
        errMsg
    })
})

process.on("message", ({ msg, pagename, chartContent, savePath }) => {
    if (msg && msg === "render-end") {
        app.quit()
    }
    if (chartContent && savePath) {
        win.webContents.send("chart-content", { chartContent, savePath })
    }
    if (pagename) {
        loadPage(pagename)
    }
})
