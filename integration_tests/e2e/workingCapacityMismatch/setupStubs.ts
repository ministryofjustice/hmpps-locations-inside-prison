import AuthStubber from '../../mockApis/auth'
import LocationsApiStubber from '../../mockApis/locationsApi'
import ManageUsersApiStubber from '../../mockApis/manageUsersApi'
import PrisonResidentialSummaryFactory from '../../../server/testutils/factories/prisonResidentialSummary'
import LocationFactory from '../../../server/testutils/factories/location'

export const wing = LocationFactory.build({
  id: '7e570000-0000-000a-0001-000000000100',
  pathHierarchy: 'A',
  key: 'TST-A',
  accommodationTypes: ['NORMAL_ACCOMMODATION'],
  capacity: {
    certifiedNormalAccommodation: 4,
    maxCapacity: 8,
    workingCapacity: 3,
  },
  currentCellCertificate: {
    workingCapacity: 4,
  },
  leafLevel: false,
  localName: null,
  specialistCellTypes: [],
  status: 'ACTIVE',
  locationType: 'WING',
})

export const landing = LocationFactory.build({
  id: '7e570000-0000-000a-0001-000000000110',
  parentId: wing.id,
  pathHierarchy: 'A-1',
  key: 'TST-A-1',
  accommodationTypes: ['NORMAL_ACCOMMODATION'],
  capacity: {
    certifiedNormalAccommodation: 2,
    maxCapacity: 4,
    workingCapacity: 2,
  },
  currentCellCertificate: {
    workingCapacity: 2,
  },
  leafLevel: false,
  localName: null,
  specialistCellTypes: [],
  status: 'ACTIVE',
  locationType: 'LANDING',
})

export const cell = LocationFactory.build({
  id: '7e570000-0000-000a-0001-000000000111',
  parentId: landing.id,
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
    workingCapacity: 1,
    maxCapacity: 2,
    specialistCellTypes: ['ACCESSIBLE_CELL', 'CONSTANT_SUPERVISION'],
  },
  leafLevel: true,
  localName: null,
  specialistCellTypes: ['ACCESSIBLE_CELL', 'CONSTANT_SUPERVISION'],
  status: 'ACTIVE',
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
  LocationsApiStubber.stub.stubLocationsConstantsApprovalType()
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
  cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
    parentLocation: cell,
  })
  LocationsApiStubber.stub.stubLocations(wing)
  LocationsApiStubber.stub.stubLocations(landing)
  LocationsApiStubber.stub.stubLocations(cell)
  LocationsApiStubber.stub.stubPrisonerLocationsId([])
  LocationsApiStubber.stub.stubLocationsCertificationPrisonSignedOpCapChange()
  LocationsApiStubber.stub.stubLocationsBulkReactivate()
  LocationsApiStubber.stub.stubUpdateCapacity()
  LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'ACTIVE' })
  LocationsApiStubber.stub.stubLocationsCertificationRequestApprovalsPrison([])
}
