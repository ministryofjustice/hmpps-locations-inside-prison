export default function dateInFuture(value: string) {
  return value === '' || new Date(value).getTime() > Date.now()
}
