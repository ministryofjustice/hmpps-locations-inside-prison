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
    workingCapacity: 0,
  },
  currentCellCertificate: {
    workingCapacity: 0,
  },
  oldWorkingCapacity: 4,
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
    workingCapacity: 0,
  },
  currentCellCertificate: {
    workingCapacity: 0,
  },
  oldWorkingCapacity: 2,
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
    workingCapacity: 0,
  },
  currentCellCertificate: {
    workingCapacity: 0,
  },
  oldWorkingCapacity: 2,
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
  let stubLanding1 = landing1
  let stubLanding2 = landing2
  let stubCell1 = cell1
  let stubCell2 = cell2
  let stubCell3 = cell3
  let stubCell4 = cell4

  if (!hasCertChange) {
    stubLocation = LocationFactory.build({
      ...location,
      currentCellCertificate: { ...location.currentCellCertificate, workingCapacity: 4 },
    })
    stubLanding1 = LocationFactory.build({
      ...landing1,
      currentCellCertificate: { ...location.currentCellCertificate, workingCapacity: 2 },
    })
    stubLanding2 = LocationFactory.build({
      ...landing2,
      currentCellCertificate: { ...location.currentCellCertificate, workingCapacity: 2 },
    })
    stubCell1 = LocationFactory.build({
      ...cell1,
      currentCellCertificate: { ...location.currentCellCertificate, workingCapacity: 1 },
    })
    stubCell2 = LocationFactory.build({
      ...cell2,
      currentCellCertificate: { ...location.currentCellCertificate, workingCapacity: 1 },
    })
    stubCell3 = LocationFactory.build({
      ...cell3,
      currentCellCertificate: { ...location.currentCellCertificate, workingCapacity: 1 },
    })
    stubCell4 = LocationFactory.build({
      ...cell4,
      currentCellCertificate: { ...location.currentCellCertificate, workingCapacity: 1 },
    })
  }

  setupStubsBase(role, stubLocation)
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({
    parentLocation: stubLocation,
    subLocations: [stubLanding1, stubLanding2],
    subLocationName: 'Landings',
  })
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({
    parentLocation: stubLanding1,
    subLocations: [stubCell1, stubCell2],
    subLocationName: 'Cells',
  })
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({
    parentLocation: stubLanding2,
    subLocations: [stubCell3, stubCell4],
    subLocationName: 'Cells',
  })
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: stubCell1 })
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: stubCell2 })
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: stubCell3 })
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: stubCell4 })
  LocationsApiStubber.stub.stubLocations(stubLanding1)
  LocationsApiStubber.stub.stubLocations(stubLanding2)
  LocationsApiStubber.stub.stubLocations(stubCell1)
  LocationsApiStubber.stub.stubLocations(stubCell2)
  LocationsApiStubber.stub.stubLocations(stubCell3)
  LocationsApiStubber.stub.stubLocations(stubCell4)
}
