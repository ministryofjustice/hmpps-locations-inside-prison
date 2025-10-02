import { format, parseISO } from 'date-fns'

export default function formatDateWithTimeAndDay(
  dateOrString: string | Date,
  options?: { showMidnightTimes?: boolean },
): string {
  const date = typeof dateOrString === 'string' ? parseISO(dateOrString) : dateOrString

  if (!date) {
    return ''
  }

  if (Number.isNaN(date.getTime())) {
    return dateOrString as string
  }

  let dateString = format(date, 'EEEE d MMMM yyyy')

  if (options?.showMidnightTimes || date.getHours() !== 0 || date.getMinutes() !== 0) {
    dateString += ` at ${format(date, 'HH:mm')}`
  }

  return dateString
}
