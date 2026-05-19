import { LocationsApiConstant } from '../data/types/locationsApi'

export default function formatConstants(
  constants: LocationsApiConstant[],
  keys: string[] | string | undefined,
  joinString = '<br>',
  dfault = '-',
): string {
  if (!keys || !keys.length) {
    return dfault
  }

  if (Array.isArray(keys)) {
    return (
      keys
        .map(key => formatConstants(constants, key))
        .filter(s => s !== '-')
        .join(joinString) || dfault
    )
  }

  return constants.find(o => o.key === keys)?.description || dfault
}
