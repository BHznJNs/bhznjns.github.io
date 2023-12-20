// [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
//                             ||
//                             ||
//                             \/
// [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]]
// 
// returns deep clone of input iterator
const pageCount = 10
export default function(itemList) {
    let startIndex = 0
    let remainItemCount = itemList.length - (startIndex + 1)
    if (remainItemCount <= pageCount) {
        return [ structuredClone(itemList) ]
    } else {
        const slices = []
        while (remainItemCount > pageCount) {
            const listSlice = itemList.slice(startIndex, startIndex + pageCount)
            slices.push(structuredClone(listSlice))
            remainItemCount -= pageCount
            startIndex += pageCount
        }
        if (itemList.length) {
            const listSlice = itemList.slice(startIndex, startIndex + pageCount)
            slices.push(structuredClone(listSlice))
        }
        return slices
    }
}
