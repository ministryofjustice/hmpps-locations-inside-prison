import AuthStubber from '../../../mockApis/auth'
import LocationsApiStubber from '../../../mockApis/locationsApi'
import ManageUsersApiStubber from '../../../mockApis/manageUsersApi'
import LocationFactory from '../../../../server/testutils/factories/location'
import { LocationResidentialSummary, PrisonResidentialSummary } from '../../../../server/data/types/locationsApi'
import { CertificationApprovalRequest } from '../../../../server/data/types/locationsApi/certificationApprovalRequest'
import CertificationApprovalRequestFactory from '../../../../server/testutils/factories/certificationApprovalRequest'

const prisonId = 'TST'
const otherActiveWing = LocationFactory.build({
  id: '7e570000-0000-1000-8000-000000000100',
  pathHierarchy: 'A',
  parentId: undefined,
  locationType: 'WING',
  localName: undefined,
  status: 'ACTIVE',
  capacity: {
    maxCapacity: 40,
    workingCapacity: 40,
  },
  currentCellCertificate: {
    maxCapacity: 40,
    workingCapacity: 40,
    certifiedNormalAccommodation: 40,
  },
  numberOfCellLocations: 10,
  level: 1,
  leafLevel: false,
})
const existingWing = LocationFactory.build({
  id: '7e570000-0000-1000-8000-000000000200',
  topLevelId: '7e570000-0000-1000-8000-000000000200',
  pathHierarchy: 'B',
  parentId: undefined,
  locationType: 'WING',
  localName: undefined,
  status: 'ACTIVE',
  capacity: {
    maxCapacity: 60,
    workingCapacity: 60,
  },
  currentCellCertificate: {
    maxCapacity: 60,
    workingCapacity: 60,
    certifiedNormalAccommodation: 60,
  },
  numberOfCellLocations: 10,
  specialistCellTypes: [],
  inCellSanitation: undefined,
  level: 1,
  leafLevel: false,
})
const existingLanding = LocationFactory.build({
  id: '7e570000-0000-1000-8000-000000000210',
  topLevelId: '7e570000-0000-1000-8000-000000000200',
  pathHierarchy: 'B-1',
  parentId: existingWing.id,
  locationType: 'LANDING',
  localName: undefined,
  status: 'ACTIVE',
  capacity: {
    maxCapacity: 20,
    workingCapacity: 20,
  },
  currentCellCertificate: {
    maxCapacity: 20,
    workingCapacity: 20,
    certifiedNormalAccommodation: 20,
  },
  numberOfCellLocations: 5,
  specialistCellTypes: [],
  inCellSanitation: undefined,
  level: 2,
  leafLevel: false,
})
const draftCell = LocationFactory.build({
  id: '7e570000-0000-1000-8000-000000000221',
  topLevelId: '7e570000-0000-1000-8000-000000000200',
  pathHierarchy: 'B-1-001',
  parentId: existingLanding.id,
  locationType: 'CELL',
  localName: undefined,
  status: 'DRAFT',
  capacity: {
    maxCapacity: 0,
    workingCapacity: 0,
  },
  pendingChanges: {
    certifiedNormalAccommodation: 1,
    workingCapacity: 1,
    maxCapacity: 1,
  },
  currentCellCertificate: undefined,
  leafLevel: true,
  cellMark: 'B1 001',
  specialistCellTypes: ['BIOHAZARD_DIRTY_PROTEST'],
  accommodationTypes: ['CARE_AND_SEPARATION'],
})
const activeCell = LocationFactory.build({
  id: '7e570000-0000-1000-8000-000000000222',
  topLevelId: '7e570000-0000-1000-8000-000000000200',
  pathHierarchy: 'B-1-002',
  parentId: existingLanding.id,
  locationType: 'CELL',
  localName: undefined,
  status: 'ACTIVE',
  capacity: {
    maxCapacity: 2,
    workingCapacity: 2,
  },
  currentCellCertificate: {
    certifiedNormalAccommodation: 2,
    workingCapacity: 2,
    maxCapacity: 2,
  },
  leafLevel: true,
  cellMark: 'B1 002',
  specialistCellTypes: ['NORMAL_ACCOMMODATION'],
})
const otherWingResidentialSummary: LocationResidentialSummary = {
  parentLocation: otherActiveWing,
  subLocationName: 'Landings',
  subLocations: [],
  topLevelLocationType: 'Wings',
  locationHierarchy: [],
  wingStructure: ['WING', 'LANDING', 'CELL'],
}
const wingResidentialSummary: LocationResidentialSummary = {
  parentLocation: existingWing,
  subLocationName: 'Landings',
  subLocations: [existingLanding],
  topLevelLocationType: 'Wings',
  locationHierarchy: [],
  wingStructure: ['WING', 'LANDING', 'CELL'],
}
const landingResidentialSummary: LocationResidentialSummary = {
  parentLocation: existingLanding,
  subLocationName: 'Cells',
  subLocations: [draftCell, activeCell],
  topLevelLocationType: 'Wings',
  locationHierarchy: [],
  wingStructure: ['WING', 'LANDING', 'CELL'],
}
const draftCellResidentialSummary: LocationResidentialSummary = {
  parentLocation: draftCell,
  subLocationName: 'Cells',
  subLocations: [],
  topLevelLocationType: 'Wings',
  locationHierarchy: [],
  wingStructure: ['WING', 'LANDING', 'CELL'],
}
const prisonResidentialSummary: PrisonResidentialSummary = {
  prisonSummary: {
    prisonName: 'Test (HMP)',
    workingCapacity: 100,
    signedOperationalCapacity: 100,
    maxCapacity: 210,
    numberOfCellLocations: 100,
  },
  topLevelLocationType: 'Wings',
  subLocationName: 'Wings',
  subLocations: [otherActiveWing, existingWing],
  locationHierarchy: [],
}
const opCapRequest = CertificationApprovalRequestFactory.build({
  id: 'opCapRequest',
  approvalType: 'SIGNED_OP_CAP',
  signedOperationCapacityChange: 20,
  prisonId,
})
const otherNewLocationsRequest = CertificationApprovalRequestFactory.build({
  id: 'otherNewLocationsRequest',
  approvalType: 'DRAFT',
  maxCapacityChange: 1,
  prisonId,
})

export default function setupStubs(roles = ['MANAGE_RESIDENTIAL_LOCATIONS'], options?: { proposedOpCap?: boolean }) {
  cy.task('reset')
  AuthStubber.stub.stubSignIn({ roles })
  LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId, certificationActive: 'ACTIVE' })
  LocationsApiStubber.stub.stubLocations(otherActiveWing)
  LocationsApiStubber.stub.stubLocations(existingWing)
  LocationsApiStubber.stub.stubLocations(existingLanding)
  LocationsApiStubber.stub.stubLocations(draftCell)
  LocationsApiStubber.stub.stubLocations(activeCell)
  LocationsApiStubber.stub.stubLocationsConstantsAccommodationType()
  LocationsApiStubber.stub.stubLocationsConstantsConvertedCellType()
  LocationsApiStubber.stub.stubLocationsConstantsDeactivatedReason()
  LocationsApiStubber.stub.stubLocationsConstantsLocationType()
  LocationsApiStubber.stub.stubLocationsConstantsApprovalType()
  LocationsApiStubber.stub.stubLocationsConstantsSpecialistCellType()
  LocationsApiStubber.stub.stubLocationsConstantsUsedForType()
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation(otherWingResidentialSummary)
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation(wingResidentialSummary)
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation(landingResidentialSummary)
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation(draftCellResidentialSummary)
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummary(prisonResidentialSummary)
  LocationsApiStubber.stub.stubLocationsCertificationPrisonSignedOpCapChange()
  LocationsApiStubber.stub.stubLocationsCertificationLocationRequestApproval()
  ManageUsersApiStubber.stub.stubManageUsers()
  ManageUsersApiStubber.stub.stubManageUsersMe()
  ManageUsersApiStubber.stub.stubManageUsersMeCaseloads()
  ManageUsersApiStubber.stub.stubManageUsersByCaseload()

  const approvalRequests: CertificationApprovalRequest[] = []

  if (options?.proposedOpCap) {
    approvalRequests.push(opCapRequest)
  }

  approvalRequests.push(otherNewLocationsRequest)

  LocationsApiStubber.stub.stubLocationsCertificationRequestApprovalsPrison(approvalRequests)
  approvalRequests.forEach(requestApproval => {
    LocationsApiStubber.stub.stubLocationsCertificationRequestApprovals(requestApproval)
  })
}

export { existingWing, existingLanding, draftCell, activeCell }
