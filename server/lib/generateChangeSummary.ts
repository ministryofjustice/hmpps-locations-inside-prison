export default function generateChangeSummary(
  valName: string,
  oldVal: number,
  newVal: number,
  overallVal: number,
): string | null {
  if (newVal === oldVal) return null

  const verb = newVal > oldVal ? 'increase' : 'decrease'
  const diff = newVal - oldVal
  const newOverallVal = overallVal + diff

  return `This will ${verb} the establishment’s ${valName} from ${overallVal} to ${newOverallVal}.`
}
