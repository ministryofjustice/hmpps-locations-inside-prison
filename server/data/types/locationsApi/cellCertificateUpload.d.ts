export type CellCertificateUploadStatus = 'PENDING' | 'STARTED' | 'FINISHED'

export type CellCertificateUploadLocationStatus = 'PENDING' | 'PROCESSED' | 'SKIPPED' | 'FAILED'

export declare interface CellCertificateUploadLocation {
  locationKey: string
  status: CellCertificateUploadLocationStatus
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
}

export declare interface CellCertificateUpload {
  id: string
  prisonId: string
  status: CellCertificateUploadStatus
  totalRecords: number
  processedRecords: number
  skippedRecords: number
  failedRecords: number
  requestedBy: string
  requestedDate: string
  startTime?: string
  endTime?: string
  cellCertificateId?: string
  reasonForChange?: string
  locations?: CellCertificateUploadLocation[]
}
