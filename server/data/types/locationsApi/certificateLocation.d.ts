export declare interface CertificateLocation {
  id: string
  locationCode: string
  pathHierarchy: string
  level: number
  certifiedNormalAccommodation: number
  workingCapacity: number
  maxCapacity: number
  locationType: LocationType
  subLocations: CertificateLocation[]
  inCellSanitation?: boolean
  cellMark?: string
  specialistCellTypes?: string[]
  accommodationTypes?: string[]
  usedFor?: string[]
}
