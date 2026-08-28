export type CellCertificateImportStatus = 'PENDING' | 'STARTED' | 'FINISHED'

export type CellCertificateImportLocationStatus = 'PENDING' | 'PROCESSED' | 'SKIPPED' | 'FAILED'

export declare interface CellCertificateImportLocation {
  locationKey: string
  status: CellCertificateImportLocationStatus
  message?: string
  processedDate?: string
  maxCapacity: number
  workingCapacity: number
  certifiedNormalAccommodation?: number
  cellMark?: string
  inCellSanitation?: boolean
  previousMaxCapacity?: number
  previousWorkingCapacity?: number
  previousCertifiedNormalAccommodation?: number
  previousCellMark?: string
  previousInCellSanitation?: boolean
  workingCapacityMismatch?: boolean
  maxCapacityMismatch?: boolean
  certifiedNormalAccommodationMismatch?: boolean
}

export declare interface CellCertificateImport {
  id: string
  prisonId: string
  status: CellCertificateImportStatus
  totalRecords: number
  processedRecords: number
  skippedRecords: number
  failedRecords: number
  discrepancyRecords?: number
  requestedBy: string
  requestedDate: string
  startTime?: string
  endTime?: string
  cellCertificateId?: string
  reasonForChange?: string
  locations?: CellCertificateImportLocation[]
}
