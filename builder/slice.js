// [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
//                             ||
//                             ||
//                             \/
// [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]]
const pageCount = 10
export default function(items) {
    if (items.length <= pageCount) {
        return [items]
    } else {
        const slices = []
        while (items.length > pageCount) {
            slices.push(items.splice(0, pageCount))
        }
        slices.push(items)
        return slices
    }
}