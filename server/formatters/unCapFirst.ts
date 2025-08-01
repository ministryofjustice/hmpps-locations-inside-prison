export default function unCapFirst(string: string) {
  return string?.replace(/^\w/, a => a.toLowerCase())
}
