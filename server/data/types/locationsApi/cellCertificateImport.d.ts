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
  appliedMaxCapacity?: number
  previousWorkingCapacity?: number
  appliedWorkingCapacity?: number
  previousCertifiedNormalAccommodation?: number
  previousCellMark?: string
  previousInCellSanitation?: boolean
  workingCapacityMismatch?: boolean
  maxCapacityMismatch?: boolean
  certifiedNormalAccommodationMismatch?: boolean
}

export declare interface CellCertificateImportOmittedLocation {
  locationId?: string
  locationKey: string
  maxCapacity?: number
  workingCapacity?: number
  certifiedNormalAccommodation?: number
}

/** Capacity totals across a whole cell certificate. */
export declare interface CellCertificateTotals {
  maxCapacity: number
  workingCapacity: number
  certifiedNormalAccommodation: number
}

/** A preview works out what the import would do without changing anything; an import changes the locations. */
export type CellCertificateImportMode = 'PREVIEW' | 'IMPORT'

export declare interface CellCertificateImport {
  id: string
  prisonId: string
  status: CellCertificateImportStatus
  mode?: CellCertificateImportMode
  /** On an import, the preview it was continued from. */
  previewUploadId?: string
  /** On a preview, the import it was continued as. */
  continuedAsUploadId?: string
  /** On a finished preview, the totals of the prison's current certificate, if it has one. */
  currentCertificateTotals?: CellCertificateTotals
  /** On a finished preview, the totals the new certificate would have if the import went ahead. */
  projectedCertificateTotals?: CellCertificateTotals
  totalRecords: number
  processedRecords: number
  skippedRecords: number
  failedRecords: number
  discrepancyRecords?: number
  notOnCertificateRecords?: number
  locationsNotOnCertificate?: CellCertificateImportOmittedLocation[]
  requestedBy: string
  requestedDate: string
  startTime?: string
  endTime?: string
  cellCertificateId?: string
  reasonForChange?: string
  locations?: CellCertificateImportLocation[]
}
