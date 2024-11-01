import { ResidentialSummary } from './residentialSummary'

export declare interface PrisonResidentialSummary extends ResidentialSummary {
  prisonSummary?: {
    workingCapacity: number
    signedOperationalCapacity: number
    maxCapacity: number
  }
}
