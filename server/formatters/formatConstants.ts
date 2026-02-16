import { LocationsApiConstant } from '../data/types/locationsApi'

export default function formatConstants(
  constants: LocationsApiConstant[],
  keys: string[] | string | undefined,
): string {
  if (!keys) {
    return '-'
  }

  if (Array.isArray(keys)) {
    return keys.map(key => formatConstants(constants, key)).join('<br>')
  }

  return constants.find(o => o.key === keys)?.description
}
