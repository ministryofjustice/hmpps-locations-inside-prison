import LocationFactory from '../../../../../server/testutils/factories/location'
import setupStubsBase from '../setupStubs'
import LocationsApiStubber from '../../../../mockApis/locationsApi'

export const location = LocationFactory.build({
  id: '7e570000-0000-000a-0001-000000000100',
  pathHierarchy: 'A',
  key: 'TST-A',
  accommodationTypes: ['NORMAL_ACCOMMODATION'],
  capacity: {
    certifiedNormalAccommodation: 4,
    maxCapacity: 8,
    workingCapacity: 4,
  },
  currentCellCertificate: {
    workingCapacity: 0,
  },
  leafLevel: false,
  localName: null,
  specialistCellTypes: [],
  status: 'INACTIVE',
  locationType: 'WING',
})

export const landing1 = LocationFactory.build({
  id: '7e570000-0000-000a-0001-000000000110',
  parentId: location.id,
  pathHierarchy: 'A-1',
  key: 'TST-A-1',
  accommodationTypes: ['NORMAL_ACCOMMODATION'],
  capacity: {
    certifiedNormalAccommodation: 2,
    maxCapacity: 4,
    workingCapacity: 2,
  },
  currentCellCertificate: {
    workingCapacity: 0,
  },
  leafLevel: false,
  localName: null,
  specialistCellTypes: [],
  status: 'INACTIVE',
  locationType: 'LANDING',
})

export const landing2 = LocationFactory.build({
  id: '7e570000-0000-000a-0001-000000000120',
  parentId: location.id,
  pathHierarchy: 'A-2',
  key: 'TST-A-2',
  accommodationTypes: ['NORMAL_ACCOMMODATION'],
  capacity: {
    certifiedNormalAccommodation: 2,
    maxCapacity: 4,
    workingCapacity: 2,
  },
  currentCellCertificate: {
    workingCapacity: 0,
  },
  leafLevel: false,
  localName: null,
  specialistCellTypes: [],
  status: 'INACTIVE',
  locationType: 'LANDING',
})

export const cell1 = LocationFactory.build({
  id: '7e570000-0000-000a-0001-000000000111',
  parentId: landing1.id,
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
  id: '7e570000-0000-000a-0001-000000000112',
  parentId: landing1.id,
  pathHierarchy: 'A-1-002',
  key: 'TST-A-1-002',
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

export const cell3 = LocationFactory.build({
  id: '7e570000-0000-000a-0001-000000000121',
  parentId: landing2.id,
  pathHierarchy: 'A-2-001',
  key: 'TST-A-2-001',
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

export const cell4 = LocationFactory.build({
  id: '7e570000-0000-000a-0001-000000000122',
  parentId: landing2.id,
  pathHierarchy: 'A-2-002',
  key: 'TST-A-2-002',
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
    subLocations: [landing1, landing2],
    subLocationName: 'Landings',
  })
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({
    parentLocation: landing1,
    subLocations: [cell1, cell2],
    subLocationName: 'Cells',
  })
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({
    parentLocation: landing2,
    subLocations: [cell3, cell4],
    subLocationName: 'Cells',
  })
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: cell1 })
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: cell2 })
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: cell3 })
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: cell4 })
  LocationsApiStubber.stub.stubLocations(landing1)
  LocationsApiStubber.stub.stubLocations(landing2)
  LocationsApiStubber.stub.stubLocations(cell1)
  LocationsApiStubber.stub.stubLocations(cell2)
  LocationsApiStubber.stub.stubLocations(cell3)
  LocationsApiStubber.stub.stubLocations(cell4)
}
