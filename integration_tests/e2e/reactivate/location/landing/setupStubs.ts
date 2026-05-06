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
    workingCapacity: 0,
  },
  currentCellCertificate: {
    workingCapacity: 0,
  },
  oldWorkingCapacity: 4,
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
    certifiedNormalAccommodation: 1,
    workingCapacity: 0,
    maxCapacity: 2,
    specialistCellTypes: ['ACCESSIBLE_CELL', 'CONSTANT_SUPERVISION'],
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
    certifiedNormalAccommodation: 2,
    workingCapacity: 0,
    maxCapacity: 2,
    specialistCellTypes: [],
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
    certifiedNormalAccommodation: 1,
    workingCapacity: 0,
    maxCapacity: 2,
    specialistCellTypes: [],
  },
  leafLevel: true,
  localName: null,
  specialistCellTypes: [],
  status: 'INACTIVE',
})

export function setupStubs(role: string, hasCertChange = true) {
  let stubLocation = location
  let stubCell1 = cell1
  let stubCell2 = cell2
  let stubCell3 = cell3

  if (!hasCertChange) {
    stubLocation = LocationFactory.build({
      ...location,
      currentCellCertificate: { ...location.currentCellCertificate, workingCapacity: 4 },
    })
    stubCell1 = LocationFactory.build({
      ...cell1,
      currentCellCertificate: { ...location.currentCellCertificate, workingCapacity: 1 },
    })
    stubCell2 = LocationFactory.build({
      ...cell2,
      currentCellCertificate: { ...location.currentCellCertificate, workingCapacity: 2 },
    })
    stubCell3 = LocationFactory.build({
      ...cell3,
      currentCellCertificate: { ...location.currentCellCertificate, workingCapacity: 1 },
    })
  }

  setupStubsBase(role, stubLocation)
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({
    parentLocation: stubLocation,
    subLocations: [stubCell1, stubCell2, stubCell3],
    subLocationName: 'Cells',
  })
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: stubCell1 })
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: stubCell2 })
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: stubCell3 })
  LocationsApiStubber.stub.stubLocations(stubCell1)
  LocationsApiStubber.stub.stubLocations(stubCell2)
  LocationsApiStubber.stub.stubLocations(stubCell3)
}
