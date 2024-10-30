import { startOfToday } from 'date-fns'

export default function dateTodayOrInFuture(value: string) {
  const parsedDate = value.split('-')
  const year = parseInt(parsedDate[0], 10)
  const month = parseInt(parsedDate[1], 10) - 1
  const date = parseInt(parsedDate[2], 10)
  const dateInput = new Date(year, month, date)
  return value === '' || dateInput >= startOfToday()
}
