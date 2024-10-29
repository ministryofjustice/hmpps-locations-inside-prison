import { LocationType } from './locationType'
import { LocationStatus } from './locationStatus'

export declare interface Location {
  id: string
  prisonId: string
  code: string
  pathHierarchy: string
  locationType: LocationType
  residentialHousingType: string
  localName: string
  comments: string
  permanentlyInactive: boolean
  permanentlyInactiveReason: string
  capacity: {
    maxCapacity: number
    workingCapacity: number
  }
  certification: {
    certified: boolean
    capacityOfCertifiedCell: number
  }
  attributes: string[]
  usage: {
    usageType: string
    capacity: number
    sequence: number
  }[]
  accommodationTypes: string[]
  specialistCellTypes: string[]
  usedFor: string[]
  orderWithinParentLocation: number
  status: LocationStatus
  convertedCellType: string
  otherConvertedCellType: string
  active: boolean
  deactivatedByParent: boolean
  deactivatedDate: string
  deactivatedReason: string
  deactivationReasonDescription?: string
  deactivatedBy: string
  proposedReactivationDate?: string
  topLevelId: string
  parentId: string
  parentLocation: string
  inactiveCells: number
  childLocations: string[]
  changeHistory: {
    attribute: string
    oldValue: string
    newValue: string
    amendedBy: string
    amendedDate: string
  }[]
  lastModifiedBy: string
  lastModifiedDate: string
  key: string
  isResidential: boolean
  leafLevel: boolean
  level: number
  sortName: string
  planetFmReference: string
  numberOfCellLocations: number
  oldWorkingCapacity: number
  raw?: Location
}
