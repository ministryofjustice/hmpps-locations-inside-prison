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
  pathHierarchy: 'A-2',
  parentId: wing.id,
  locationType: 'LANDING',
  status: 'ACTIVE',
  localName: undefined,
  numberOfCellLocations: 5,
})

const residentialSummary: LocationResidentialSummary = {
  parentLocation: landing,
  subLocationName: 'Cells',
  subLocations: [
    LocationFactory.build({
      id: '7e570000-0000-1000-8000-000000000111',
      prisonId,
      pathHierarchy: 'A-2-001',
      code: '001',
      cellMark: '1',
      parentId: landing.id,
      locationType: 'CELL',
      status: 'ACTIVE',
      localName: undefined,
    }),
    LocationFactory.build({
      id: '7e570000-0000-1000-8000-000000000112',
      prisonId,
      pathHierarchy: 'A-2-002',
      code: '002',
      cellMark: '2',
      parentId: landing.id,
      locationType: 'CELL',
      status: 'LOCKED_DRAFT',
      localName: undefined,
    }),
    LocationFactory.build({
      id: '7e570000-0000-1000-8000-000000000113',
      prisonId,
      pathHierarchy: 'A-2-003',
      code: '003',
      cellMark: '3',
      parentId: landing.id,
      locationType: 'CELL',
      status: 'DRAFT',
      localName: undefined,
      specialistCellTypes: ['BIOHAZARD_DIRTY_PROTEST'],
      pendingChanges: {
        certifiedNormalAccommodation: 3,
        workingCapacity: 4,
        maxCapacity: 5,
      },
      currentCellCertificate: undefined,
      inCellSanitation: false,
    }),
    LocationFactory.build({
      id: '7e570000-0000-1000-8000-000000000114',
      prisonId,
      pathHierarchy: 'A-2-004',
      code: '004',
      cellMark: '4',
      parentId: landing.id,
      locationType: 'CELL',
      status: 'DRAFT',
      localName: undefined,
      specialistCellTypes: [],
      pendingChanges: {
        certifiedNormalAccommodation: 4,
        workingCapacity: 5,
        maxCapacity: 6,
      },
      currentCellCertificate: undefined,
      inCellSanitation: true,
    }),
    LocationFactory.build({
      id: '7e570000-0000-1000-8000-000000000115',
      prisonId,
      pathHierarchy: 'A-2-005',
      code: '005',
      cellMark: '5',
      parentId: landing.id,
      locationType: 'CELL',
      status: 'DRAFT',
      localName: undefined,
      specialistCellTypes: [],
      pendingChanges: {
        certifiedNormalAccommodation: 5,
        workingCapacity: 6,
        maxCapacity: 7,
      },
      currentCellCertificate: undefined,
      inCellSanitation: false,
    }),
  ],
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
  LocationsApiStubber.stub.stubLocationsConstantsAccommodationType()
  LocationsApiStubber.stub.stubLocationsConstantsConvertedCellType()
  LocationsApiStubber.stub.stubLocationsConstantsDeactivatedReason()
  LocationsApiStubber.stub.stubLocationsConstantsLocationType()
  LocationsApiStubber.stub.stubLocationsConstantsSpecialistCellType()
  LocationsApiStubber.stub.stubLocationsConstantsUsedForType()
  LocationsApiStubber.stub.stubLocationsEditCells(landing)
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation(residentialSummary)
  ManageUsersApiStubber.stub.stubManageUsers()
  ManageUsersApiStubber.stub.stubManageUsersMe()
  ManageUsersApiStubber.stub.stubManageUsersMeCaseloads()
}

export { prisonId, wing, landing, residentialSummary }
