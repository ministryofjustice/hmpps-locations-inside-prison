import { format, parseISO } from 'date-fns'

export default function formatDate(dateOrString: string | Date) {
  const date = typeof dateOrString === 'string' ? parseISO(dateOrString) : dateOrString

  if (Number.isNaN(date.getTime())) {
    return dateOrString as string
  }

  return format(date, 'd MMMM yyyy')
}
