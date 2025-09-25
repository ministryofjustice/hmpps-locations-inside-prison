import AuthStubber from '../../mockApis/auth'
import LocationsApiStubber from '../../mockApis/locationsApi'
import ManageUsersApiStubber from '../../mockApis/manageUsersApi'
import LocationFactory from '../../../server/testutils/factories/location'
import { LocationResidentialSummary, PrisonResidentialSummary } from '../../../server/data/types/locationsApi'
import { CertificationApprovalRequest } from '../../../server/data/types/locationsApi/certificationApprovalRequest'
import CertificationApprovalRequestFactory from '../../../server/testutils/factories/certificationApprovalRequest'

const prisonId = 'TST'
const otherDraftWing = LocationFactory.build({
  id: '7e570000-0000-1000-8000-000000000100',
  pathHierarchy: 'A',
  parentId: undefined,
  locationType: 'WING',
  localName: undefined,
  status: 'DRAFT',
  capacity: {
    maxCapacity: 0,
    workingCapacity: 0,
  },
  pendingChanges: {
    certifiedNormalAccommodation: 20,
    workingCapacity: 20,
    maxCapacity: 40,
  },
  numberOfCellLocations: 10,
})
const draftWing = LocationFactory.build({
  id: '7e570000-0000-1000-8000-000000000200',
  pathHierarchy: 'B',
  parentId: undefined,
  locationType: 'WING',
  localName: undefined,
  status: 'DRAFT',
  capacity: {
    maxCapacity: 0,
    workingCapacity: 0,
  },
  pendingChanges: {
    certifiedNormalAccommodation: 20,
    workingCapacity: 20,
    maxCapacity: 40,
  },
  numberOfCellLocations: 10,
  specialistCellTypes: [],
  inCellSanitation: undefined,
})
const draftLanding = LocationFactory.build({
  id: '7e570000-0000-1000-8000-000000000210',
  pathHierarchy: 'B-1',
  parentId: draftWing.id,
  locationType: 'LANDING',
  localName: undefined,
  status: 'DRAFT',
  capacity: {
    maxCapacity: 0,
    workingCapacity: 0,
  },
  pendingChanges: {
    certifiedNormalAccommodation: 10,
    workingCapacity: 10,
    maxCapacity: 20,
  },
  numberOfCellLocations: 5,
  specialistCellTypes: [],
  inCellSanitation: undefined,
})
const draftCell1 = LocationFactory.build({
  id: '7e570000-0000-1000-8000-000000000211',
  pathHierarchy: 'B-1-001',
  parentId: draftLanding.id,
  locationType: 'CELL',
  localName: undefined,
  status: 'DRAFT',
  capacity: {
    maxCapacity: 0,
    workingCapacity: 0,
  },
  pendingChanges: {
    certifiedNormalAccommodation: 5,
    workingCapacity: 5,
    maxCapacity: 10,
  },
  leafLevel: true,
  cellMark: 'B1 001',
  specialistCellTypes: ['NORMAL_ACCOMMODATION'],
})
const draftCell2 = LocationFactory.build({
  id: '7e570000-0000-1000-8000-000000000212',
  pathHierarchy: 'B-1-002',
  parentId: draftLanding.id,
  locationType: 'CELL',
  localName: undefined,
  status: 'DRAFT',
  capacity: {
    maxCapacity: 0,
    workingCapacity: 0,
  },
  pendingChanges: {
    certifiedNormalAccommodation: 5,
    workingCapacity: 5,
    maxCapacity: 10,
  },
  leafLevel: true,
  cellMark: 'B1 002',
  specialistCellTypes: ['BIOHAZARD_DIRTY_PROTEST'],
})
const otherWingResidentialSummary: LocationResidentialSummary = {
  parentLocation: otherDraftWing,
  subLocationName: 'Landings',
  subLocations: [],
  topLevelLocationType: 'Wings',
  locationHierarchy: [],
  wingStructure: ['WING', 'LANDING', 'CELL'],
}
const wingResidentialSummary: LocationResidentialSummary = {
  parentLocation: draftWing,
  subLocationName: 'Landings',
  subLocations: [draftLanding],
  topLevelLocationType: 'Wings',
  locationHierarchy: [],
  wingStructure: ['WING', 'LANDING', 'CELL'],
}
const landingResidentialSummary: LocationResidentialSummary = {
  parentLocation: draftLanding,
  subLocationName: 'Cells',
  subLocations: [draftCell1, draftCell2],
  topLevelLocationType: 'Wings',
  locationHierarchy: [],
  wingStructure: ['WING', 'LANDING', 'CELL'],
}
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
  subLocations: [otherDraftWing, draftWing],
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
  maxCapacityChange: 40,
  prisonId,
})

export default function setupStubs(roles = ['MANAGE_RESIDENTIAL_LOCATIONS'], options?: { proposedOpCap?: boolean }) {
  cy.task('reset')
  cy.task('setFeatureFlag', { createAndCertify: true })
  AuthStubber.stub.stubSignIn({ roles })
  LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId, certificationActive: 'ACTIVE' })
  LocationsApiStubber.stub.stubLocations(otherDraftWing)
  LocationsApiStubber.stub.stubLocations(draftWing)
  LocationsApiStubber.stub.stubLocations(draftLanding)
  LocationsApiStubber.stub.stubLocations(draftCell1)
  LocationsApiStubber.stub.stubLocations(draftCell2)
  LocationsApiStubber.stub.stubLocationsConstantsAccommodationType()
  LocationsApiStubber.stub.stubLocationsConstantsConvertedCellType()
  LocationsApiStubber.stub.stubLocationsConstantsDeactivatedReason()
  LocationsApiStubber.stub.stubLocationsConstantsLocationType()
  LocationsApiStubber.stub.stubLocationsConstantsSpecialistCellType()
  LocationsApiStubber.stub.stubLocationsConstantsUsedForType()
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation(otherWingResidentialSummary)
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation(wingResidentialSummary)
  LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation(landingResidentialSummary)
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

export { draftWing, draftLanding, draftCell1, draftCell2 }
