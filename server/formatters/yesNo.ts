export default function yesNo(value: string) {
  const yesNoMap: Record<string, string> = {
    true: 'Yes',
    false: 'No',
  }
  return yesNoMap[value] ?? '-'
}
