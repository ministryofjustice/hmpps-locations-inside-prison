import AuthStubber from '../../../../mockApis/auth'
import LocationsApiStubber from '../../../../mockApis/locationsApi'
import ManageUsersApiStubber from '../../../../mockApis/manageUsersApi'
import PrisonResidentialSummaryFactory from '../../../../../server/testutils/factories/prisonResidentialSummary'
import LocationFactory from '../../../../../server/testutils/factories/location'

export const location = LocationFactory.build({
  accommodationTypes: ['NORMAL_ACCOMMODATION'],
  capacity: {
    maxCapacity: 2,
    workingCapacity: 1,
  },
  leafLevel: true,
  localName: null,
  specialistCellTypes: ['ACCESSIBLE_CELL', 'CONSTANT_SUPERVISION'],
})

export function setupStubs(role: string, stubLocation = location) {
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
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({
    parentLocation: stubLocation,
  })
  LocationsApiStubber.stub.stubLocations(stubLocation)
  LocationsApiStubber.stub.stubPrisonerLocationsId([])
  LocationsApiStubber.stub.stubLocationsDeactivateTemporary()
  LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'ACTIVE' })
  LocationsApiStubber.stub.stubLocationsCertificationRequestApprovalsPrison([])
}
