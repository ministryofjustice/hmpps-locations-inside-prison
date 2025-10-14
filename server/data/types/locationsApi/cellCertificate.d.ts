export declare interface CellCertificate {
  id: string
  prisonId: string
  approvedBy: string
  approvedDate: string
  certificationApprovalRequestId: string
  totalWorkingCapacity: number
  totalMaxCapacity: number
  totalCertifiedNormalAccommodation: number
  current: boolean
  approvedRequest: CertificationApprovalRequest
  locations: CertificateLocation[]
}
