export declare interface CertificateLocation {
  id: string
  locationCode: string
  currentCellMark?: string
  cellMark?: string
  localName?: string
  pathHierarchy: string
  level: number
  certifiedNormalAccommodation: number
  workingCapacity: number
  maxCapacity: number
  currentCertifiedNormalAccommodation: number
  currentWorkingCapacity: number
  currentMaxCapacity: number
  currentInCellSanitation?: boolean
  inCellSanitation?: boolean
  locationType: LocationType
  accommodationTypes?: string[]
  currentSpecialistCellTypes?: string[]
  specialistCellTypes?: string[]
  usedFor?: string[]
  currentConvertedCellType?: string
  convertedCellType?: string
  currentOtherConvertedCellType?: string
  otherConvertedCellType?: string
  subLocations: CertificateLocation[]
}
