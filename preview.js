const express = require("express")
const app = express()

const port = 3000

app.use("/preview", express.static("./"))
app.listen(port, () => {
    console.log(`http://localhost:${port}/preview/`)
})