import { LocationsApiConstant } from '../data/types/locationsApi'

export default function formatConstants(
  constants: LocationsApiConstant[],
  keys: string[] | string | undefined,
  joinString = '<br>',
  defaultValue = '-',
): string {
  if (!keys || !keys.length) {
    return defaultValue
  }

  if (Array.isArray(keys)) {
    return (
      keys
        .map(key => formatConstants(constants, key))
        .filter(s => s !== defaultValue)
        .join(joinString) || defaultValue
    )
  }

  return constants.find(o => o.key === keys)?.description || defaultValue
}
