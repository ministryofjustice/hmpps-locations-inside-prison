import { Location } from './location'
import { ResidentialSummary } from './residentialSummary'
import { LocationType } from './locationType'

export declare interface LocationResidentialSummary extends ResidentialSummary {
  parentLocation: Location
  wingStructure: LocationType[]
}
