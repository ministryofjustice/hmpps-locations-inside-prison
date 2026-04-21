export declare interface CertificationApprovalRequest {
  id: string
  locationId: string
  approvalType:
    | 'SIGNED_OP_CAP'
    | 'DRAFT'
    | 'DEACTIVATION'
    | 'CELL_MARK'
    | 'CELL_SANITATION'
    | 'REACTIVATION'
    | 'CAPACITY_CHANGE'
    | 'PRISON_BASELINE'
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
}
