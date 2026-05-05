import { ResidentialSummary } from './residentialSummary'
import { CellCertificate } from './cellCertificate'

export declare interface PrisonResidentialSummary extends ResidentialSummary {
  prisonSummary: {
    prisonName: string
    workingCapacity: number
    signedOperationalCapacity: number
    maxCapacity: number
    numberOfCellLocations: number
    currentCertificate?: CellCertificate
  }
}
