import { Location } from './location'
import { LocationSummary } from './locationSummary'

export declare interface ResidentialSummary {
  prisonSummary?: {
    workingCapacity: number
    signedOperationalCapacity: number
    maxCapacity: number
  }
  parentLocation?: Location
  topLevelLocationType: string
  subLocationName: string
  subLocations: Location[]
  locationHierarchy: LocationSummary[]
}
