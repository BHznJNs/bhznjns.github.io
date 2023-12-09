function addLeadingZero(num, target) {
    let numStr = num.toString();
    while (numStr.length < target) {
        numStr = "0" + numStr
    }
    return numStr;
}

const weekDayNames = [
    "Sun", "Mon", "Tue",
    "Wed", "Thu", "Fri",
    "Sat",
]
const monthNames = [
    "Jan", "Feb", "Mar",
    "Apr", "May", "Jun",
    "Jul", "Aug", "Sep",
    "Oct", "Nov", "Dec",
]
const weekDay  = date => weekDayNames[date.getDay()]
const month    = date => monthNames[date.getMonth()]
const time     = date => `${addLeadingZero(date.getHours(), 2)}:${addLeadingZero(date.getMinutes(), 2)}:00`;
const timezone = () => {
    const timezone = (-(new Date()).getTimezoneOffset() / 60)
    return (timezone >= 0 ? "+" : "-") + addLeadingZero((timezone * 100).toString(), 4)
}

export default (date) =>
    `${weekDay(date)}, ${date.getDate()} ${month(date)} ${date.getFullYear()} ${time(date)} ${timezone(date)}`
