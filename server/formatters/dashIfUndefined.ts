export default function dashIfUndefined(string: string) {
  if (string === undefined) {
    return '-'
  }

  return string
}
