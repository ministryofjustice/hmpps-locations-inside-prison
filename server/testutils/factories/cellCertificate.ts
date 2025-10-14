import { Factory } from 'fishery'

import { CellCertificate } from '../../data/types/locationsApi'
import CertificationApprovalRequestFactory from './certificationApprovalRequest'

const CellCertificateFactory = Factory.define<CellCertificate>(() => {
  return {
    id: 'cellCertificateId1',
    prisonId: 'TST',
    approvedBy: 'TEST_USER',
    approvedDate: '2025-06-05T10:35:17',
    certificationApprovalRequestId: 'certificationApprovalRequestId1',
    totalWorkingCapacity: 100,
    totalMaxCapacity: 200,
    totalCertifiedNormalAccommodation: 150,
    signedOperationCapacity: 175,
    current: false,
    approvedRequest: CertificationApprovalRequestFactory.build(),
    locations: CertificationApprovalRequestFactory.build().locations,
  }
})

export default CellCertificateFactory
