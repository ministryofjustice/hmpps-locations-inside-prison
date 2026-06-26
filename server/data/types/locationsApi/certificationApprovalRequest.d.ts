export declare type CertificationApprovalRequestType =
  | 'SIGNED_OP_CAP'
  | 'DRAFT'
  | 'DEACTIVATION'
  | 'CELL_MARK'
  | 'CELL_SANITATION'
  | 'REACTIVATION'
  | 'CAPACITY_CHANGE'
  | 'PRISON_BASELINE'
  | 'TEMP_NON_RESIDENTIAL_CONVERSION'
  | 'SPECIALIST_CELL_TYPE'
  | 'CONVERT_ROOM_TO_CELL'
  | 'CONVERT_CELL_TO_ROOM'

export declare interface CertificationApprovalRequest {
  id: string
  locationId: string
  approvalType: CertificationApprovalRequestType
  prisonId: string
  locationKey: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN'
  requestedBy: string
  requestedDate: string
  approvedOrRejectedBy: string
  approvedOrRejectedDate: string
  comments: string
  certifiedNormalAccommodationChange: number
  workingCapacityChange: number
  maxCapacityChange: number
  signedOperationCapacityChange: number
  currentSignedOperationCapacity: number
  certificateId: string
  cellMark: string
  currentCellMark: string
  inCellSanitation: boolean
  currentInCellSanitation: boolean
  reasonForChange: string
  locations: CertificateLocation[]
  deactivatedReason: string
  deactivationReasonDescription: string
  proposedReactivationDate: string
  planetFmReference: string
  maxCapacity?: number
  workingCapacity?: number
  certifiedNormalAccommodation?: number
  specialistCellTypes?: string[]
  currentSpecialistCellTypes?: string[]
  currentConvertedCellType?: string
  convertedCellType?: string
  currentOtherConvertedCellType?: string
  otherConvertedCellType?: string
  topLevelAccommodationTypes?: string[]
  topLevelUsedFor?: string[]
}
