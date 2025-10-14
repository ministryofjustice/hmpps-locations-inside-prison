import { ResidentialSummary } from './residentialSummary'

export declare interface PrisonResidentialSummary extends ResidentialSummary {
  prisonSummary: {
    prisonName: string
    workingCapacity: number
    signedOperationalCapacity: number
    maxCapacity: number
    numberOfCellLocations: number
  }
}
