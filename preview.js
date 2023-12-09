import express from "express"

const app = express()
const port = 3000

app.use("/preview", express.static("./"))
app.use("/rss_resources", express.static("./.rss_resources"))
app.listen(port, "0.0.0.0")
