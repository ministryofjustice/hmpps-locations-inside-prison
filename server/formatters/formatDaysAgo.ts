import { differenceInCalendarDays, parseISO } from 'date-fns'

export default function formatDaysAgo(dateOrString: string | Date) {
  const date = typeof dateOrString === 'string' ? parseISO(dateOrString) : dateOrString
  const today = new Date()

  if (!date) {
    return ''
  }

  if (Number.isNaN(date.getTime())) {
    return dateOrString as string
  }

  if (date.toLocaleDateString() === today.toLocaleDateString()) {
    return 'Today'
  }

  const days = Math.max(differenceInCalendarDays(today, date), 1)
  return `${days} day${days === 1 ? '' : 's'} ago`
}
