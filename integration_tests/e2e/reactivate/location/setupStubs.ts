import AuthStubber from '../../../mockApis/auth'
import LocationsApiStubber from '../../../mockApis/locationsApi'
import ManageUsersApiStubber from '../../../mockApis/manageUsersApi'
import PrisonResidentialSummaryFactory from '../../../../server/testutils/factories/prisonResidentialSummary'
import { Location } from '../../../../server/data/types/locationsApi'

export default function setupStubs(role: string, location: Location) {
  cy.task('reset')
  AuthStubber.stub.stubSignIn({ roles: [role] })
  ManageUsersApiStubber.stub.stubManageUsers()
  ManageUsersApiStubber.stub.stubManageUsersMe()
  ManageUsersApiStubber.stub.stubManageUsersMeCaseloads()
  LocationsApiStubber.stub.stubLocationsConstantsAccommodationType()
  LocationsApiStubber.stub.stubLocationsConstantsConvertedCellType()
  LocationsApiStubber.stub.stubLocationsConstantsDeactivatedReason()
  LocationsApiStubber.stub.stubLocationsConstantsLocationType()
  LocationsApiStubber.stub.stubLocationsConstantsSpecialistCellType()
  LocationsApiStubber.stub.stubLocationsConstantsUsedForType()
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummary(
    PrisonResidentialSummaryFactory.build({
      prisonSummary: {
        workingCapacity: 9,
        signedOperationalCapacity: 11,
        maxCapacity: 10,
      },
    }),
  )
  LocationsApiStubber.stub.stubLocations(location)
  LocationsApiStubber.stub.stubPrisonerLocationsId([])
  LocationsApiStubber.stub.stubLocationsDeactivateTemporary()
  LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'ACTIVE' })
  LocationsApiStubber.stub.stubLocationsCertificationRequestApprovalsPrison([])
}
