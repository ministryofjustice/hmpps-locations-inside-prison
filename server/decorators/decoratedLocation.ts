import { Location } from '../data/locationsApiClient'

export interface DecoratedLocation extends Omit<Location, 'locationType'> {
  raw: Location

  accommodationTypes: string[]
  convertedCellType: string
  deactivatedBy: string
  deactivatedReason: string
  lastModifiedBy: string
  locationType: string
  specialistCellTypes: string[]
  usedFor: string[]
}
