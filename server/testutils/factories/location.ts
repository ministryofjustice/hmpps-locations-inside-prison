import { Factory } from 'fishery'

import { Location } from '../../data/types/locationsApi'

const LocationFactory = Factory.define<Location>(() => {
  return {
    id: '7e570000-0000-0000-0000-000000000001',
    prisonId: 'TST',
    code: '001',
    pathHierarchy: 'A-1-001',
    locationType: 'CELL',
    residentialHousingType: 'NORMAL_ACCOMMODATION',
    localName: 'Wing A',
    comments: 'Not to be used',
    permanentlyInactive: false,
    permanentlyInactiveReason: 'Demolished',
    capacity: {
      maxCapacity: 2,
      workingCapacity: 2,
    },
    certification: {
      certified: true,
      capacityOfCertifiedCell: 1,
    },
    attributes: ['ANTI_BARRICADE_DOOR'],
    usage: [
      {
        usageType: 'APPOINTMENT',
        capacity: 0,
        sequence: 0,
      },
    ],
    accommodationTypes: ['NORMAL_ACCOMMODATION'],
    specialistCellTypes: ['BIOHAZARD_DIRTY_PROTEST'],
    usedFor: ['CLOSE_SUPERVISION_CENTRE'],
    orderWithinParentLocation: 1,
    status: 'ACTIVE',
    convertedCellType: 'OFFICE',
    otherConvertedCellType: 'string',
    active: true,
    deactivatedByParent: false,
    deactivatedDate: '2023-01-23',
    deactivatedReason: 'DAMAGED',
    deactivatedBy: 'string',
    proposedReactivationDate: '2026-01-24',
    planetFmReference: '2323/45M',
    topLevelId: '57718979-573c-433a-9e51-2d83f887c11c',
    parentId: '57718979-573c-433a-9e51-2d83f887c11c',
    parentLocation: 'string',
    inactiveCells: 0,
    childLocations: ['string'],
    changeHistory: [
      {
        attribute: 'Location Type',
        oldValue: 'CELL',
        newValue: 'WING',
        amendedBy: 'user',
        amendedDate: '2021-07-05T10:35:17',
      },
    ],
    lastModifiedBy: 'string',
    lastModifiedDate: '2021-07-05T10:35:17',
    key: 'TST-A-1-001',
    isResidential: true,
    leafLevel: false,
    level: 1,
    sortName: 'A-1-001',
    numberOfCellLocations: 0,
    oldWorkingCapacity: 0,
  }
})

export default LocationFactory
