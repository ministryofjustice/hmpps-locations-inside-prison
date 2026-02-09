import AuthStubber from '../../../../mockApis/auth'
import LocationsApiStubber from '../../../../mockApis/locationsApi'
import ManageUsersApiStubber from '../../../../mockApis/manageUsersApi'
import PrisonResidentialSummaryFactory from '../../../../../server/testutils/factories/prisonResidentialSummary'
import LocationFactory from '../../../../../server/testutils/factories/location'

export const location = LocationFactory.build({
  locationType: 'WING',
  code: 'A',
  pathHierarchy: 'A',
  accommodationTypes: ['NORMAL_ACCOMMODATION'],
  capacity: {
    maxCapacity: 40,
    workingCapacity: 30,
  },
  leafLevel: false,
  localName: null,
  specialistCellTypes: [],
})

export function setupStubs(role: string) {
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
        maxCapacity: 30,
      },
    }),
  )
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({
    parentLocation: location,
  })
  LocationsApiStubber.stub.stubLocations(location)
  LocationsApiStubber.stub.stubPrisonerLocationsId([])
  LocationsApiStubber.stub.stubLocationsDeactivateTemporary()
  LocationsApiStubber.stub.stubLocationsCertificationPrisonSignedOpCapChange()
  LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'ACTIVE' })
  LocationsApiStubber.stub.stubLocationsCertificationRequestApprovalsPrison([])
}
