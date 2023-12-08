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

export default (date) =>
    `${weekDay(date)}, ${date.getDate()} ${month(date)} ${date.getFullYear()}`
