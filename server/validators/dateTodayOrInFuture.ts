export default function dateTodayOrInFuture(value: string) {
  const today = new Date()
  today.setHours(0)
  today.setMinutes(0)
  today.setSeconds(0)
  return value === '' || new Date(value).getTime() >= today.getTime()
}
