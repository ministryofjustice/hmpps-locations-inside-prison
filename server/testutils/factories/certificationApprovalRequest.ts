import { Factory } from 'fishery'

import { CertificationApprovalRequest } from '../../data/types/locationsApi/certificationApprovalRequest'

const CertificationApprovalRequestFactory = Factory.define<CertificationApprovalRequest>(() => {
  return {
    id: 'id1',
    locationId: '7e570000-0000-1000-8000-000000000001',
    approvalType: 'DRAFT',
    prisonId: 'TST',
    locationKey: 'TST-A',
    status: 'PENDING',
    requestedBy: 'DAVE',
    requestedDate: '2024-10-03T09:18:58',
    approvedOrRejectedBy: 'SIMON',
    approvedOrRejectedDate: '2024-10-03T09:18:58',
    comments: 'Some comments',
    certifiedNormalAccommodationChange: 1,
    workingCapacityChange: 2,
    maxCapacityChange: 3,
    signedOperationCapacityChange: 4,
    reasonForSignedOpChange: 'Needed to change it',
    locations: [],
  }
})

export default CertificationApprovalRequestFactory
