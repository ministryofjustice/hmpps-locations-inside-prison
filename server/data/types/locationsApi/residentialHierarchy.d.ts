export declare interface ResidentialHierarchy {
  locationId: string
  locationType: string
  locationCode: string
  fullLocationPath: string
  localName: string
  level: number
  status: string
  subLocations: ResidentialHierarchy[]
}
