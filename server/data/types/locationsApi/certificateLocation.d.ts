export declare interface CertificateLocation {
  id: string
  locationCode: string
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
  inCellSanitation?: boolean
  locationType: LocationType
  accommodationTypes?: string[]
  specialistCellTypes?: string[]
  usedFor?: string[]
  convertedCellType?: string[]
  subLocations: CertificateLocation[]
}
