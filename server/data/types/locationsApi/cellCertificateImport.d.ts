export type CellCertificateImportStatus = 'PENDING' | 'STARTED' | 'FINISHED'

export type CellCertificateImportLocationStatus = 'PENDING' | 'PROCESSED' | 'SKIPPED' | 'FAILED'

/** The cell's state when the import ran: whether it was inactive, and why, and its specialist cell types (MAPA-428). */
export declare interface CellCertificateImportCellState {
  inactive?: boolean
  deactivatedReason?: string
  deactivationReasonDescription?: string
  specialistCellTypes?: string[]
}

export declare interface CellCertificateImportLocation extends CellCertificateImportCellState {
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
  /** What the current certificate held for this cell when the import ran; absent when the cell was not on it. */
  currentCertifiedMaxCapacity?: number
  currentCertifiedWorkingCapacity?: number
  currentCertifiedNormalAccommodation?: number
  /** For a row whose location was not found: the cell it most likely meant (names differ only by leading zeros). */
  suggestedLocationKey?: string
  /** Set when the cell is converted to another use, such as an office. It holds no capacity and is certified at 0. */
  convertedCellType?: string
}

export declare interface CellCertificateImportOmittedLocation extends CellCertificateImportCellState {
  locationId?: string
  locationKey: string
  maxCapacity?: number
  workingCapacity?: number
  certifiedNormalAccommodation?: number
  /** On the current certificate, so carried forward unchanged, rather than added to the certificate. */
  onCurrentCertificate?: boolean
  /** The name a failed row most likely used for this cell (names differ only by leading zeros). */
  uploadedAsKey?: string
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
  /** Of notOnCertificateRecords, those carried forward from the current certificate. */
  carriedForwardRecords?: number
  locationsNotOnCertificate?: CellCertificateImportOmittedLocation[]
  requestedBy: string
  requestedDate: string
  startTime?: string
  endTime?: string
  cellCertificateId?: string
  reasonForChange?: string
  locations?: CellCertificateImportLocation[]
}
