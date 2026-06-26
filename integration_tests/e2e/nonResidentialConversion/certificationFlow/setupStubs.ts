import AuthStubber from '../../../mockApis/auth'
import LocationsApiStubber from '../../../mockApis/locationsApi'
import ManageUsersApiStubber from '../../../mockApis/manageUsersApi'
import LocationFactory from '../../../../server/testutils/factories/location'
import PrisonResidentialSummaryFactory from '../../../../server/testutils/factories/prisonResidentialSummary'

const prisonId = 'TST'
const location = LocationFactory.build({
  id: '7e570000-0000-0000-0000-000000000001',
  accommodationTypes: ['NORMAL_ACCOMMODATION'],
  capacity: {
    maxCapacity: 2,
    workingCapacity: 1,
  },
  leafLevel: true,
  localName: '1-1-001',
  specialistCellTypes: ['ACCESSIBLE_CELL', 'CONSTANT_SUPERVISION'],
})

const prisonResidentialSummary = PrisonResidentialSummaryFactory.build({
  prisonSummary: {
    prisonName: 'Test (HMP)',
    workingCapacity: 8,
    signedOperationalCapacity: 9,
    maxCapacity: 9,
  },
  subLocationName: 'Cells',
  subLocations: [location],
})

export default function setupStubs(roles = ['MANAGE_RES_LOCATIONS_OP_CAP']) {
  cy.task('reset')
  AuthStubber.stub.stubSignIn({ roles })
  ManageUsersApiStubber.stub.stubManageUsers()
  ManageUsersApiStubber.stub.stubManageUsersMe()
  ManageUsersApiStubber.stub.stubManageUsersMeCaseloads()
  LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId, certificationActive: 'ACTIVE' })
  LocationsApiStubber.stub.stubLocationsConstantsAccommodationType()
  LocationsApiStubber.stub.stubLocationsConstantsConvertedCellType()
  LocationsApiStubber.stub.stubLocationsConstantsDeactivatedReason()
  LocationsApiStubber.stub.stubLocationsConstantsLocationType()
  LocationsApiStubber.stub.stubLocationsConstantsApprovalType()
  LocationsApiStubber.stub.stubLocationsConstantsSpecialistCellType()
  LocationsApiStubber.stub.stubLocationsConstantsUsedForType()
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummary(prisonResidentialSummary)
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: location })
  LocationsApiStubber.stub.stubLocations(location)
  LocationsApiStubber.stub.stubPrisonerLocationsId([])
  LocationsApiStubber.stub.stubLocationsConvertCellToNonResCell()
  LocationsApiStubber.stub.stubLocationsCertificationPrisonSignedOpCapChange()
  LocationsApiStubber.stub.stubLocationsCertificationLocationRequestApproval()
  LocationsApiStubber.stub.stubLocationsCertificationRequestApprovalsPrison([])
}

export { prisonId, location, prisonResidentialSummary }
