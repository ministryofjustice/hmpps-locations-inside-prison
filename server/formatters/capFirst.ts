export default function capFirst(string: string) {
  return string.replace(/^\w/, a => a.toUpperCase())
}
