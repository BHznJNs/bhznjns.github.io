import config from "../../../build.config.js"
import writeIndexTemplate from "../../indexTemplate.js"

if (!config.homepage.endsWith("/")) {
    config.homepage += "/"
}
writeIndexTemplate()
