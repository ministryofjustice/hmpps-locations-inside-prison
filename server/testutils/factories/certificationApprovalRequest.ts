import { Factory } from 'fishery'

import { CertificationApprovalRequest } from '../../data/types/locationsApi/certificationApprovalRequest'
import CertificateLocationFactory from './certificateLocation'

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
    currentSignedOperationCapacity: 5,
    certificateId: 'some-certificate-uuid',
    cellMark: 'A-1x',
    currentCellMark: 'A-1',
    reasonForSignedOpChange: 'Needed to change it',
    reasonForChange: 'Needed to change it',
    locations: [
      CertificateLocationFactory.build({
        locationCode: 'A',
        pathHierarchy: 'A',
        level: 1,
        certifiedNormalAccommodation: 20,
        workingCapacity: 10,
        maxCapacity: 30,
        locationType: 'WING',
        inCellSanitation: undefined,
        cellMark: undefined,
        specialistCellTypes: undefined,
        accommodationTypes: ['NORMAL_ACCOMMODATION', 'HEALTHCARE_INPATIENTS'],
        usedFor: ['CLOSE_SUPERVISION_CENTRE', 'TEST_TYPE'],
        subLocations: [
          CertificateLocationFactory.build({
            locationCode: '1',
            pathHierarchy: 'A-1',
            level: 2,
            certifiedNormalAccommodation: 10,
            workingCapacity: 5,
            maxCapacity: 15,
            locationType: 'LANDING',
            inCellSanitation: undefined,
            cellMark: undefined,
            specialistCellTypes: undefined,
            subLocations: [
              CertificateLocationFactory.build({
                locationCode: '001',
                pathHierarchy: 'A-1-001',
                cellMark: 'A1-01',
              }),
              CertificateLocationFactory.build({
                locationCode: '002',
                pathHierarchy: 'A-1-002',
                cellMark: 'A1-02',
              }),
              CertificateLocationFactory.build({
                locationCode: '003',
                pathHierarchy: 'A-1-003',
                cellMark: 'A1-03',
              }),
              CertificateLocationFactory.build({
                locationCode: '004',
                pathHierarchy: 'A-1-004',
                cellMark: 'A1-04',
              }),
              CertificateLocationFactory.build({
                locationCode: '005',
                pathHierarchy: 'A-1-005',
                cellMark: 'A1-05',
              }),
            ],
          }),
          CertificateLocationFactory.build({
            locationCode: '2',
            pathHierarchy: 'A-2',
            level: 2,
            certifiedNormalAccommodation: 10,
            workingCapacity: 5,
            maxCapacity: 15,
            locationType: 'LANDING',
            inCellSanitation: undefined,
            cellMark: undefined,
            specialistCellTypes: undefined,
            subLocations: [
              CertificateLocationFactory.build({
                locationCode: '001',
                pathHierarchy: 'A-2-001',
                cellMark: 'A2-01',
              }),
              CertificateLocationFactory.build({
                locationCode: '002',
                pathHierarchy: 'A-2-002',
                cellMark: 'A2-02',
              }),
              CertificateLocationFactory.build({
                locationCode: '003',
                pathHierarchy: 'A-2-003',
                cellMark: 'A2-03',
              }),
              CertificateLocationFactory.build({
                locationCode: '004',
                pathHierarchy: 'A-2-004',
                cellMark: 'A2-04',
              }),
              CertificateLocationFactory.build({
                locationCode: '005',
                pathHierarchy: 'A-2-005',
                cellMark: 'A2-05',
              }),
            ],
          }),
        ],
      }),
    ],
  }
})

export default CertificationApprovalRequestFactory
