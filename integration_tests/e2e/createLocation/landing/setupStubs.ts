import AuthStubber from '../../../mockApis/auth'
import LocationsApiStubber from '../../../mockApis/locationsApi'
import ManageUsersApiStubber from '../../../mockApis/manageUsersApi'
import LocationFactory from '../../../../server/testutils/factories/location'
import { LocationResidentialSummary } from '../../../../server/data/types/locationsApi'

const prisonId = 'TST'
const existingWingLocation = LocationFactory.build({
  id: '7e570000-0000-1000-8000-000000000002',
  pathHierarchy: 'A',
  parentId: undefined,
  locationType: 'WING',
  localName: undefined,
})
const existingLandingLocation = LocationFactory.build({
  id: '7e570000-0000-1000-8000-000000000003',
  pathHierarchy: 'A-1',
  parentId: '7e570000-0000-1000-8000-000000000002',
  locationType: 'LANDING',
  localName: undefined,
})
const residentialSummary: LocationResidentialSummary = {
  parentLocation: existingWingLocation,
  subLocationName: 'Landings',
  subLocations: [existingLandingLocation],
  topLevelLocationType: 'Wings',
  locationHierarchy: [],
  wingStructure: ['WING', 'LANDING', 'CELL'],
}

export default function setupStubs(roles = ['MANAGE_RESIDENTIAL_LOCATIONS']) {
  cy.task('reset')
  cy.task('setFeatureFlag', { createAndCertify: true })
  AuthStubber.stub.stubSignIn({ roles })
  LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId, certificationActive: 'ACTIVE' })
  LocationsApiStubber.stub.stubLocations(existingLandingLocation)
  LocationsApiStubber.stub.stubLocations(existingWingLocation)
  LocationsApiStubber.stub.stubLocationsConstantsAccommodationType()
  LocationsApiStubber.stub.stubLocationsConstantsConvertedCellType()
  LocationsApiStubber.stub.stubLocationsConstantsDeactivatedReason()
  LocationsApiStubber.stub.stubLocationsConstantsLocationType()
  LocationsApiStubber.stub.stubLocationsConstantsSpecialistCellType()
  LocationsApiStubber.stub.stubLocationsConstantsUsedForType()
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation(residentialSummary)
  LocationsApiStubber.stub.stubLocationsPrisonLocalName({ exists: false, name: 'testL', prisonId })
  ManageUsersApiStubber.stub.stubManageUsers()
  ManageUsersApiStubber.stub.stubManageUsersMe()
  ManageUsersApiStubber.stub.stubManageUsersMeCaseloads()
}

export { prisonId, existingWingLocation, existingLandingLocation, residentialSummary }
