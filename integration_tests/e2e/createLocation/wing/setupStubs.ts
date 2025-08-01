import LocationFactory from '../../../../server/testutils/factories/location'
import { PrisonResidentialSummary } from '../../../../server/data/types/locationsApi'
import AuthStubber from '../../../mockApis/auth'
import LocationsApiStubber from '../../../mockApis/locationsApi'
import ManageUsersApiStubber from '../../../mockApis/manageUsersApi'

const prisonId = 'TST'
const existingWingLocation = LocationFactory.build({
  id: '7e570000-0000-1000-8000-000000000002',
  pathHierarchy: 'A',
  parentId: undefined,
  locationType: 'WING',
  localName: undefined,
})
const residentialSummary: PrisonResidentialSummary = {
  prisonSummary: {
    workingCapacity: 0,
    signedOperationalCapacity: 0,
    maxCapacity: 0,
  },
  subLocationName: 'Wings',
  subLocations: [existingWingLocation],
  topLevelLocationType: 'Wings',
  locationHierarchy: [],
}

export default function setupStubs(roles = ['MANAGE_RESIDENTIAL_LOCATIONS']) {
  cy.task('reset')
  cy.task('setFeatureFlag', { createAndCertify: true })
  AuthStubber.stub.stubSignIn({ roles })
  LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId, certificationActive: 'ACTIVE' })
  LocationsApiStubber.stub.stubLocationsConstantsAccommodationType()
  LocationsApiStubber.stub.stubLocationsConstantsConvertedCellType()
  LocationsApiStubber.stub.stubLocationsConstantsDeactivatedReason()
  LocationsApiStubber.stub.stubLocationsConstantsLocationType()
  LocationsApiStubber.stub.stubLocationsConstantsSpecialistCellType()
  LocationsApiStubber.stub.stubLocationsConstantsUsedForType()
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummary(residentialSummary)
  LocationsApiStubber.stub.stubLocationsPrisonLocalName({ exists: false, name: 'testW', prisonId: 'TST' })
  ManageUsersApiStubber.stub.stubManageUsers()
  ManageUsersApiStubber.stub.stubManageUsersMe()
  ManageUsersApiStubber.stub.stubManageUsersMeCaseloads()
}

export { prisonId, existingWingLocation, residentialSummary }
