import { writeFileSync } from "node:fs"
import { indexFilePath } from "./path.js"
import slice from "./utils/slice.js"
import { dateFormater } from "./utils/timeFormat.js"

export default function(newestList) {
    const sliced = slice(newestList)
    const count  = sliced.length

    let index = 0
    for (const slice of sliced) {
        index += 1
        writeFileSync(indexFilePath + "newest_" + index, JSON.stringify({
            total: count,
            current: index,
            content: slice.map(item => {
                return {
                    title: item.name,
                    link:  item.path,
                    date:  dateFormater(item.createTime)
                }
            }),
        }))
    }
}