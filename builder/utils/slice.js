import { config } from "./loadConfig.js"

// [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
//                             ||
//                             ||
//                             \/
// [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]]
// 
// returns deep clone of input iterator
const { pageSize } = config
export default function(itemList) {
    let startIndex = 0
    let remainItemCount = itemList.length - (startIndex + 1)
    if (remainItemCount <= pageSize) {
        return [ structuredClone(itemList) ]
    } else {
        const slices = []
        while (remainItemCount > pageSize) {
            const listSlice = itemList.slice(startIndex, startIndex + pageSize)
            slices.push(structuredClone(listSlice))
            remainItemCount -= pageSize
            startIndex += pageSize
        }
        if (itemList.length) {
            const listSlice = itemList.slice(startIndex, startIndex + pageSize)
            slices.push(structuredClone(listSlice))
        }
        return slices
    }
}
