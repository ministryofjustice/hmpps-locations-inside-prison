import { Factory } from 'fishery'

import { CertificateLocation } from '../../data/types/locationsApi/certificateLocation'

const CertificateLocationFactory = Factory.define<CertificateLocation>(() => {
  return {
    id: 'certificateLocationId1',
    locationCode: '001',
    pathHierarchy: 'A-1-001',
    level: 3,
    certifiedNormalAccommodation: 2,
    workingCapacity: 1,
    maxCapacity: 3,
    currentCertifiedNormalAccommodation: 2,
    currentWorkingCapacity: 1,
    currentMaxCapacity: 3,
    locationType: 'CELL',
    subLocations: [],
    inCellSanitation: true,
    cellMark: 'A1-1',
    specialistCellTypes: ['NORMAL_ACCOMMODATION'],
  }
})

export default CertificateLocationFactory
