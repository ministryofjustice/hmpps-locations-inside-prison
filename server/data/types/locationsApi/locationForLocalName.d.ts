export declare interface LocationForLocalName {
  id: string
  prisonId: string
  code: string
  pathHierarchy: string
  locationType: string
  localName: string
  comments: string
  permanentlyInactive: boolean
  permanentlyInactiveReason: string
  capacity: {
    maxCapacity: number
    workingCapacity: number
  }
  oldWorkingCapacity: number
  certification: {
    certified: boolean
    capacityOfCertifiedCell: number
  }
  usage: {
    usageType: string
    capacity: number
    sequence: number
  }[]
  accommodationTypes: string[]
  specialistCellTypes: string[]
  usedFor: string[]
  status: string
  convertedCellType: string
  active: boolean
  deactivatedByParent: boolean
  deactivatedDate: string
  deactivatedReason: string
  deactivationReasonDescription: string
  proposedReactivationDate: string
  planetFmReference: string
  topLevelId: string
  level: number
  leafLevel: boolean
  parentId: string
  inactiveCells: number
  numberOfCellLocations: number
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
}
