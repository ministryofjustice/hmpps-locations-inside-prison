import AuthStubber from '../../mockApis/auth'
import LocationsApiStubber from '../../mockApis/locationsApi'
import ManageUsersApiStubber from '../../mockApis/manageUsersApi'
import { CellCertificateDashboardEntry } from '../../../server/data/types/locationsApi/cellCertificateDashboard'

// TST is first so it is the active caseload (its prison configuration is stubbed below)
const caseloads = [
  { id: 'TST', name: 'Test (HMP)' },
  { id: 'ALI', name: 'Albany (HMP)' },
  { id: 'BMI', name: 'Birmingham (HMP)' },
  { id: 'LEI', name: 'Leeds (HMP)' },
  { id: 'MDI', name: 'Moorland (HMP & YOI)' },
]

const buildEntry = (
  prisonId: string,
  prisonName: string,
  overrides: Partial<CellCertificateDashboardEntry> = {},
): CellCertificateDashboardEntry => ({
  prisonId,
  prisonName,
  certifiedWorkingCapacity: 413,
  signedOperationCapacity: 413,
  pendingChangeRequests: 0,
  certificateLastUpdated: '2025-11-08T09:00:00',
  ...overrides,
})

// Includes WMI, which is NOT in the user's caseloads, to demonstrate the caseload filter
const dashboard: CellCertificateDashboardEntry[] = [
  buildEntry('ALI', 'Albany (HMP)', {
    certifiedWorkingCapacity: 1186,
    signedOperationCapacity: 1190,
    certificateLastUpdated: '2025-02-02T09:00:00',
  }),
  buildEntry('BMI', 'Birmingham (HMP)', {
    certifiedWorkingCapacity: 985,
    signedOperationCapacity: 960,
    pendingChangeRequests: 1,
    certificateLastUpdated: '2025-01-18T09:00:00',
  }),
  buildEntry('LEI', 'Leeds (HMP)', {
    certifiedWorkingCapacity: 1068,
    signedOperationCapacity: 1068,
    certificateLastUpdated: '2024-11-08T09:00:00',
  }),
  buildEntry('MDI', 'Moorland (HMP & YOI)', {
    certifiedWorkingCapacity: 650,
    signedOperationCapacity: 650,
    certificateLastUpdated: '2025-09-30T09:00:00',
  }),
  buildEntry('TST', 'Test (HMP)', {
    certifiedWorkingCapacity: 640,
    signedOperationCapacity: 643,
    pendingChangeRequests: 2,
    certificateLastUpdated: '2025-09-30T09:00:00',
  }),
  buildEntry('WMI', 'Wymott (HMP)', {
    certifiedWorkingCapacity: 1177,
    signedOperationCapacity: 1175,
    certificateLastUpdated: '2025-01-18T09:00:00',
  }),
]

context('Capacity management dashboard', () => {
  beforeEach(() => {
    cy.task('reset')
    AuthStubber.stub.stubSignIn({ roles: ['RESI__CERT_VIEWER'] })
    ManageUsersApiStubber.stub.stubManageUsersMeCaseloads(caseloads)
    LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'ACTIVE' })
    LocationsApiStubber.stub.stubLocationsCellCertificateDashboard(dashboard)
    cy.signIn()
  })

  it('displays only the caseload prisons and their certificate summary', () => {
    cy.visit('/capacity-management-dashboard')

    cy.get('h1').should('contain', 'Capacity management dashboard')
    cy.get('[data-qa="dashboard-caption"]').should('contain', 'Cell certificates for all establishments')

    // Breadcrumb links back to the Locations home page
    cy.get('.govuk-breadcrumbs').contains('a', 'Locations').should('have.attr', 'href', '/')

    // 5 caseload prisons render; Wymott (not in caseload) is filtered out
    cy.get('[data-qa="capacity-management-dashboard-table"] tbody tr').should('have.length', 5)
    cy.get('[data-qa="capacity-management-dashboard-table"]').should('not.contain', 'Wymott (HMP)')

    // Date formatting and "View" link target
    cy.get('[data-qa="capacity-management-dashboard-table"]').should('contain', '2 February 2025')
    cy.get('[data-qa="capacity-management-dashboard-table"]')
      .contains('a', 'View')
      .should('have.attr', 'href')
      .and('match', /\/cell-certificate\/current$/)

    cy.screenshot('capacity-management-dashboard', { capture: 'fullPage' })
  })
})
