function addLeadingZero(num) {
    numStr = num.toString();
    while (numStr.length < 2) {
        numStr = "0" + numStr
    }
    return numStr;
}

const weekDayNames = [
    "Mon", "Tues", "Wed",
    "Thur", "Fri", "Sat",
    "Sun",
]
const weekDay = (date) => weekDayNames[date.getDay() - 1]

const monthNames = [
    "Jan", "Feb", "Mar",
    "Apr", "May", "Jun",
    "Jul", "Aug", "Sep",
    "Oct", "Nov", "Dec",
]
const month = (date) => monthNames[date.getMonth()]

const time = (date) => `${addLeadingZero(date.getHours())}:${addLeadingZero(date.getMinutes())}:00`;
const timezone = (date) => date.getTimezoneOffset() === 0 ? "GMT" : "BST";

export default (date) =>
    `${weekDay(date)}, ${date.getDate()} ${month(date)} ${date.getFullYear()} ${time(date)} ${timezone(date)}`
