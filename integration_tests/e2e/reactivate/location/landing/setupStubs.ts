import LocationFactory from '../../../../../server/testutils/factories/location'
import setupStubsBase from '../setupStubs'
import LocationsApiStubber from '../../../../mockApis/locationsApi'

export const location = LocationFactory.build({
  id: '7e570000-0000-000a-0001-000000000010',
  pathHierarchy: 'A-1',
  key: 'TST-A-1',
  accommodationTypes: ['NORMAL_ACCOMMODATION'],
  capacity: {
    certifiedNormalAccommodation: 4,
    maxCapacity: 6,
    workingCapacity: 4,
  },
  currentCellCertificate: {
    workingCapacity: 0,
  },
  leafLevel: false,
  localName: null,
  specialistCellTypes: ['ACCESSIBLE_CELL', 'CONSTANT_SUPERVISION'],
  status: 'INACTIVE',
  locationType: 'LANDING',
})

export const cell1 = LocationFactory.build({
  id: '7e570000-0000-000a-0001-000000000011',
  parentId: location.id,
  pathHierarchy: 'A-1-001',
  key: 'TST-A-1-001',
  accommodationTypes: ['NORMAL_ACCOMMODATION'],
  capacity: {
    certifiedNormalAccommodation: 1,
    maxCapacity: 2,
    workingCapacity: 0,
  },
  oldWorkingCapacity: 1,
  currentCellCertificate: {
    workingCapacity: 0,
  },
  leafLevel: true,
  localName: null,
  specialistCellTypes: ['ACCESSIBLE_CELL', 'CONSTANT_SUPERVISION'],
  status: 'INACTIVE',
})

export const cell2 = LocationFactory.build({
  id: '7e570000-0000-000a-0001-000000000012',
  parentId: location.id,
  pathHierarchy: 'A-1-002',
  key: 'TST-A-1-002',
  accommodationTypes: ['NORMAL_ACCOMMODATION'],
  capacity: {
    certifiedNormalAccommodation: 2,
    maxCapacity: 2,
    workingCapacity: 0,
  },
  oldWorkingCapacity: 2,
  currentCellCertificate: {
    workingCapacity: 0,
  },
  leafLevel: true,
  localName: null,
  specialistCellTypes: [],
  status: 'INACTIVE',
})

export const cell3 = LocationFactory.build({
  id: '7e570000-0000-000a-0001-000000000013',
  parentId: location.id,
  pathHierarchy: 'A-1-003',
  key: 'TST-A-1-003',
  accommodationTypes: ['NORMAL_ACCOMMODATION'],
  capacity: {
    certifiedNormalAccommodation: 1,
    maxCapacity: 2,
    workingCapacity: 0,
  },
  oldWorkingCapacity: 1,
  currentCellCertificate: {
    workingCapacity: 0,
  },
  leafLevel: true,
  localName: null,
  specialistCellTypes: [],
  status: 'INACTIVE',
})

export function setupStubs(role: string) {
  setupStubsBase(role, location)
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({
    parentLocation: location,
    subLocations: [cell1, cell2, cell3],
    subLocationName: 'Cells',
  })
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: cell1 })
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: cell2 })
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: cell3 })
}
