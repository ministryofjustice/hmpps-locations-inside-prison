export declare interface CertificationApprovalRequest {
  id: string
  locationId: string
  approvalType: string
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
  reasonForSignedOpChange: string
  locations: CertificateLocation[]
}
