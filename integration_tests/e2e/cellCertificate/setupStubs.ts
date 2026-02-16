import AuthStubber from '../../mockApis/auth'
import LocationsApiStubber from '../../mockApis/locationsApi'
import ManageUsersApiStubber from '../../mockApis/manageUsersApi'
import { CertificationApprovalRequest } from '../../../server/data/types/locationsApi/certificationApprovalRequest'
import CertificationApprovalRequestFactory from '../../../server/testutils/factories/certificationApprovalRequest'
import { PrisonResidentialSummary } from '../../../server/data/types/locationsApi'
import LocationFactory from '../../../server/testutils/factories/location'

const prisonId = 'TST'
const prisonResidentialSummary: PrisonResidentialSummary = {
  prisonSummary: {
    prisonName: 'Test (HMP)',
    workingCapacity: 100,
    signedOperationalCapacity: 100,
    maxCapacity: 200,
    numberOfCellLocations: 100,
  },
  topLevelLocationType: 'Wings',
  subLocationName: 'Wings',
  subLocations: [],
  locationHierarchy: [],
}

export default function setupStubs(roles = ['MANAGE_RES_LOCATIONS_OP_CAP']) {
  cy.task('reset')
  AuthStubber.stub.stubSignIn({ roles })
  LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId, certificationActive: 'ACTIVE' })
  LocationsApiStubber.stub.stubLocationsConstantsAccommodationType()
  LocationsApiStubber.stub.stubLocationsConstantsConvertedCellType()
  LocationsApiStubber.stub.stubLocationsConstantsDeactivatedReason()
  LocationsApiStubber.stub.stubLocationsConstantsLocationType()
  LocationsApiStubber.stub.stubLocationsConstantsSpecialistCellType()
  LocationsApiStubber.stub.stubLocationsConstantsUsedForType()
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummary(prisonResidentialSummary)
  LocationsApiStubber.stub.stubLocations(LocationFactory.build({ id: '7e570000-0000-1000-8000-000000000001' }))
  LocationsApiStubber.stub.stubLocations(
    LocationFactory.build({ id: '7e570000-0000-1000-8000-000000000002', locationType: 'WING' }),
  )
  ManageUsersApiStubber.stub.stubManageUsers()
  ManageUsersApiStubber.stub.stubManageUsersMe()
  ManageUsersApiStubber.stub.stubManageUsersMeCaseloads()
  ManageUsersApiStubber.stub.stubManageUsersByCaseload()

  const approvalRequests: CertificationApprovalRequest[] = []

  approvalRequests.push(
    CertificationApprovalRequestFactory.build({
      id: 'opCapRequest',
      approvalType: 'SIGNED_OP_CAP',
      signedOperationCapacityChange: 20,
      prisonId,
    }),
  )

  approvalRequests.push(
    CertificationApprovalRequestFactory.build({
      id: 'otherNewLocationsRequest',
      approvalType: 'DRAFT',
      maxCapacityChange: 40,
      prisonId,
    }),
  )

  LocationsApiStubber.stub.stubLocationsCertificationRequestApprovalsPrison(approvalRequests)
  approvalRequests.forEach(requestApproval => {
    LocationsApiStubber.stub.stubLocationsCertificationRequestApprovals(requestApproval)
  })
}
