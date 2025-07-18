import { capitalize } from 'lodash'

const singularToPluralMap: Record<string, string> = {
  LANDING: 'Landings',
  CELL: 'Cells',
  SPUR: 'Spurs',
}

export default function pluralize(level: string) {
  return singularToPluralMap[level.toUpperCase()] || capitalize(level.toLowerCase())
}
