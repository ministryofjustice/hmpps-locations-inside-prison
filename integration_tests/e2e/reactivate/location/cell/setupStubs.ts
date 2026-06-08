import LocationFactory from '../../../../../server/testutils/factories/location'
import setupStubsBase from '../setupStubs'
import LocationsApiStubber from '../../../../mockApis/locationsApi'

export const location = LocationFactory.build({
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
  inactiveStatus: 'INACTIVE_MATCHING_CELL_CERT',
})

export function setupStubs(role: string, hasCertChange = true) {
  let stubLocation = location

  if (!hasCertChange) {
    stubLocation = LocationFactory.build({
      ...location,
      currentCellCertificate: { ...location.currentCellCertificate, workingCapacity: 1 },
      inactiveStatus: 'INACTIVE_TEMP',
    })
  }

  setupStubsBase(role, stubLocation)
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({
    parentLocation: stubLocation,
  })
}
