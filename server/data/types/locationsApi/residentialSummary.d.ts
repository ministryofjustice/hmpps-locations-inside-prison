import { Location } from './location'
import { LocationSummary } from './locationSummary'

export declare interface ResidentialSummary {
  topLevelLocationType: string
  subLocationName: string
  subLocations: Location[]
  locationHierarchy: LocationSummary[]
}
