import { parseISO } from 'date-fns'
import formatDate from './formatDate'
import formatTime from './formatTime'

export default function formatDateWithTime(
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

  if (!options?.showMidnightTimes && date.getHours() === 0 && date.getMinutes() === 0) {
    return formatDate(date)
  }

  return `${formatDate(date)} at ${formatTime(date)}`
}
