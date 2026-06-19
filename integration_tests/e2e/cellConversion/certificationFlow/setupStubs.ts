import AuthStubber from '../../../mockApis/auth'
import LocationsApiStubber from '../../../mockApis/locationsApi'
import ManageUsersApiStubber from '../../../mockApis/manageUsersApi'
import LocationFactory from '../../../../server/testutils/factories/location'
import { LocationResidentialSummary } from '../../../../server/data/types/locationsApi'

const prisonId = 'TST'
const wing = LocationFactory.build({
  id: '7e570000-0000-1000-8000-000000000100',
  pathHierarchy: 'A',
  parentId: undefined,
  locationType: 'WING',
  localName: undefined,
})
const landing = LocationFactory.build({
  id: '7e570000-0000-1000-8000-000000000110',
  pathHierarchy: 'A-1',
  parentId: '7e570000-0000-1000-8000-000000000100',
  locationType: 'LANDING',
  localName: undefined,
})
const location = LocationFactory.build({
  id: '7e570000-0000-1000-8000-000000000111',
  pathHierarchy: 'A-1-001',
  parentId: '7e570000-0000-1000-8000-000000000110',
  topLevelId: '7e570000-0000-1000-8000-000000000100',
  locationType: 'ROOM',
  localName: undefined,
  specialistCellTypes: [],
  usedFor: [],
})
const residentialSummary: LocationResidentialSummary = {
  parentLocation: landing,
  subLocationName: 'Cells',
  subLocations: [],
  topLevelLocationType: 'Wings',
  locationHierarchy: [],
  wingStructure: ['WING', 'LANDING', 'CELL'],
}

export default function setupStubs(roles = ['MANAGE_RESIDENTIAL_LOCATIONS']) {
  cy.task('reset')
  AuthStubber.stub.stubSignIn({ roles })
  LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId, certificationActive: 'ACTIVE' })
  LocationsApiStubber.stub.stubLocations(wing)
  LocationsApiStubber.stub.stubLocations(landing)
  LocationsApiStubber.stub.stubLocations(location)
  LocationsApiStubber.stub.stubLocationsConstantsAccommodationType()
  LocationsApiStubber.stub.stubLocationsConstantsConvertedCellType()
  LocationsApiStubber.stub.stubLocationsConstantsDeactivatedReason()
  LocationsApiStubber.stub.stubLocationsConstantsLocationType()
  LocationsApiStubber.stub.stubLocationsConstantsSpecialistCellType()
  LocationsApiStubber.stub.stubLocationsConstantsUsedForType()
  LocationsApiStubber.stub.stubLocationsConstantsUsedForTypeForPrison()
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummary()
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation(residentialSummary)
  LocationsApiStubber.stub.stubLocationsPrisonLocalName({ exists: false, name: 'testL', prisonId })
  LocationsApiStubber.stub.stubPrisonerLocationsId([])
  LocationsApiStubber.stub.stubLocationsConvertToCell()
  LocationsApiStubber.stub.stubLocationsCertificationRequestApprovalsPrison([])
  ManageUsersApiStubber.stub.stubManageUsers()
  ManageUsersApiStubber.stub.stubManageUsersMe()
  ManageUsersApiStubber.stub.stubManageUsersMeCaseloads()
}

export { prisonId, wing, landing, residentialSummary, location }
