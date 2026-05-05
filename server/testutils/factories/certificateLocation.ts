import { Factory } from 'fishery'

import { CertificateLocation } from '../../data/types/locationsApi/certificateLocation'

const CertificateLocationFactory = Factory.define<CertificateLocation>(() => {
  return {
    id: '7e570000-0000-0000-0000-000000000001',
    locationCode: '001',
    pathHierarchy: 'A-1-001',
    level: 3,
    certifiedNormalAccommodation: 2,
    workingCapacity: 2,
    maxCapacity: 2,
    currentCertifiedNormalAccommodation: 2,
    currentWorkingCapacity: 2,
    currentMaxCapacity: 2,
    locationType: 'CELL',
    subLocations: [],
    inCellSanitation: true,
    currentCellMark: 'A1-1',
    cellMark: 'A1-1',
    currentSpecialistCellTypes: ['BIOHAZARD_DIRTY_PROTEST'],
    specialistCellTypes: ['BIOHAZARD_DIRTY_PROTEST'],
    accommodationTypes: ['NORMAL_ACCOMMODATION'],
    usedFor: ['CLOSE_SUPERVISION_CENTRE'],
  }
})

export default CertificateLocationFactory
