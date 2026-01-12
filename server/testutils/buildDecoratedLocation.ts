import { DeepPartialObject } from 'fishery'
import { Location } from '../data/types/locationsApi'
import { DecoratedLocation } from '../decorators/decoratedLocation'
import LocationFactory from './factories/location'

const buildDecoratedLocation = (params?: DeepPartialObject<Location>): DecoratedLocation => {
  const location = LocationFactory.build(params)

  const locationType = location.locationType.toLowerCase().replace(/^\w/, a => a.toUpperCase())
  return {
    ...location,
    raw: location,
    locationType,
    accommodationTypes: location.accommodationTypes.map(s => s.toLowerCase().replace(/^\w/, a => a.toUpperCase())),
    convertedCellType: location.convertedCellType
      ? location.convertedCellType.toLowerCase().replace(/^\w/, a => a.toUpperCase())
      : location.convertedCellType,
    displayName: location.localName || `${locationType.toLowerCase()} ${location.pathHierarchy}`,
    specialistCellTypes: location.specialistCellTypes.map(s => s.toLowerCase().replace(/^\w/, a => a.toUpperCase())),
    usedFor: location.usedFor.map(s => s.toLowerCase().replace(/^\w/, a => a.toUpperCase())),
  }
}

export default buildDecoratedLocation
