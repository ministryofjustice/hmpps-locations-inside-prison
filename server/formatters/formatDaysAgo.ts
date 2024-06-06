import { parseISO } from 'date-fns'

export default function formatDaysAgo(dateOrString: string | Date) {
  const date = typeof dateOrString === 'string' ? parseISO(dateOrString) : dateOrString
  const today = new Date()

  if (Number.isNaN(date.getTime())) {
    return dateOrString as string
  }

  if (date.toLocaleDateString() === today.toLocaleDateString()) {
    return 'Today'
  }

  const days = Math.max(Math.floor((today.getTime() - date.getTime()) / 86_400_000), 1)
  return `${days} day${days === 1 ? '' : 's'} ago`
}
