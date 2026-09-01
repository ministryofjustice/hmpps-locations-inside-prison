import Page from '../../pages/page'
import CellCertificateImportsListPage from '../../pages/cellCertificateImports/list'
import CellCertificateImportDetailPage from '../../pages/cellCertificateImports/detail'
import { CellCertificateImport } from '../../../server/data/types/locationsApi/cellCertificateImport'
import paths from '../../../server/utils/paths'
import ManageUsersApiStubber from '../../mockApis/manageUsersApi'
import AuthStubber from '../../mockApis/auth'
import LocationsApiStubber from '../../mockApis/locationsApi'

const completedImport: CellCertificateImport = {
  id: 'import-1',
  prisonId: 'TST',
  status: 'FINISHED',
  totalRecords: 2,
  processedRecords: 1,
  skippedRecords: 1,
  failedRecords: 0,
  discrepancyRecords: 1,
  requestedBy: 'USER1',
  requestedDate: '2024-01-01T10:00:00',
  startTime: '2024-01-01T10:00:05',
  endTime: '2024-01-01T10:01:00',
  cellCertificateId: 'cert-1',
  locations: [
    {
      locationKey: 'TST-A-1-001',
      status: 'PROCESSED',
      message: 'Working capacity and certified working capacity do not match',
      maxCapacity: 3,
      workingCapacity: 1,
      certifiedNormalAccommodation: 2,
      previousMaxCapacity: 2,
      previousWorkingCapacity: 2,
      previousCertifiedNormalAccommodation: 2,
      workingCapacityMismatch: true,
    },
    {
      locationKey: 'TST-A-1-002',
      status: 'SKIPPED',
      message: 'No changes required',
      maxCapacity: 2,
      workingCapacity: 2,
      certifiedNormalAccommodation: 2,
    },
  ],
}

const inProgressImport: CellCertificateImport = {
  id: 'import-2',
  prisonId: 'TST',
  status: 'STARTED',
  totalRecords: 5,
  processedRecords: 2,
  skippedRecords: 0,
  failedRecords: 0,
  requestedBy: 'USER1',
  requestedDate: '2024-01-02T10:00:00',
  startTime: '2024-01-02T10:00:05',
  locations: [],
}

context('Cell certificate imports', () => {
  beforeEach(() => {
    cy.task('reset')
    AuthStubber.stub.stubSignIn({ roles: ['MANAGE_RES_LOCATIONS_ADMIN'] })
    ManageUsersApiStubber.stub.stubManageUsers()
    ManageUsersApiStubber.stub.stubManageUsersMe()
    ManageUsersApiStubber.stub.stubManageUsersMeCaseloads()
    ManageUsersApiStubber.stub.stubManageCaseloads()
    LocationsApiStubber.stub.stubPrisonConfiguration()
    cy.signIn()
  })

  it('lists completed imports and drills into the detail with a cell certificate link', () => {
    LocationsApiStubber.stub.stubCellCertificateImportsList([completedImport])
    LocationsApiStubber.stub.stubCellCertificateImport(completedImport)
    CellCertificateImportsListPage.goTo('TST')
    const listPage = Page.verifyOnPage(CellCertificateImportsListPage)
    listPage.newImportButton().should('exist')
    listPage.importsTable().should('contain', 'Complete')

    listPage.firstImportLink().click()

    const detailPage = Page.verifyOnPage(CellCertificateImportDetailPage)
    detailPage.summary().should('contain', 'Complete')
    detailPage.summary().should('contain', 'USER1')
    detailPage.locationsTable().should('contain', 'TST-A-1-001')
    detailPage.locationsTable().should('contain', '2 → 3')
    detailPage.locationsTable().should('contain', 'No changes required')
    detailPage.cellCertificateLink().should('have.attr', 'href', paths.cellCertificate.view('TST', 'cert-1'))
  })

  it('flags the cells whose working capacity does not match the certificate', () => {
    LocationsApiStubber.stub.stubCellCertificateImport(completedImport)

    cy.visit(`${paths.prison.cellCertificateImports('TST')}/import/import-1`)
    const detailPage = Page.verifyOnPage(CellCertificateImportDetailPage)

    detailPage.summary().should('contain', 'Cells needing review')
    detailPage.needsReviewAlert().should('contain', 'Check these cells’ working capacities')
    detailPage.needsReviewTags().should('have.length', 1)
    // the location kept its working capacity of 2 while the certificate records 1
    detailPage.locationsTable().should('contain', 'Certified 1')
    detailPage.locationsTable().should('contain', 'Working capacity and certified working capacity do not match')
  })

  it('hides the import button and shows a message while an import is in progress', () => {
    LocationsApiStubber.stub.stubCellCertificateImportsList([inProgressImport])

    CellCertificateImportsListPage.goTo('TST')
    const listPage = Page.verifyOnPage(CellCertificateImportsListPage)
    listPage.inProgressMessage().should('exist')
    listPage.newImportButton().should('not.exist')
    listPage.importsTable().should('contain', 'Processing')
  })

  it('shows the in-progress message on the detail page for an unfinished import', () => {
    LocationsApiStubber.stub.stubCellCertificateImport(inProgressImport)

    cy.visit(`${paths.prison.cellCertificateImports('TST')}/import/import-2`)
    const detailPage = Page.verifyOnPage(CellCertificateImportDetailPage)
    detailPage.inProgressMessage().should('exist')
    detailPage.cellCertificateLink().should('not.exist')
    detailPage.summary().should('contain', 'Processing')
  })

  it('redirects the URLs the pages used to live at', () => {
    LocationsApiStubber.stub.stubCellCertificateImportsList([])

    cy.visit('/TST/admin/ingest-cert')
    Page.verifyOnPage(CellCertificateImportsListPage)
    cy.location('pathname').should('eq', paths.prison.cellCertificateImports('TST'))

    cy.visit('/TST/cell-certificate-uploads')
    Page.verifyOnPage(CellCertificateImportsListPage)
    cy.location('pathname').should('eq', paths.prison.cellCertificateImports('TST'))
  })

  it('redirects a bookmarked report from the old uploads URL', () => {
    LocationsApiStubber.stub.stubCellCertificateImport(completedImport)

    cy.visit('/TST/cell-certificate-uploads/upload/import-1')
    Page.verifyOnPage(CellCertificateImportDetailPage)
    cy.location('pathname').should('eq', `${paths.prison.cellCertificateImports('TST')}/import/import-1`)
  })

  it('shows a message when there are no imports', () => {
    LocationsApiStubber.stub.stubCellCertificateImportsList([])

    CellCertificateImportsListPage.goTo('TST')
    const listPage = Page.verifyOnPage(CellCertificateImportsListPage)
    listPage.noImportsMessage().should('exist')
    listPage.newImportButton().should('exist')
  })
})

context('Cell certificate imports - capacity management', () => {
  beforeEach(() => {
    cy.task('reset')
    AuthStubber.stub.stubSignIn({ roles: ['RESI__CERT_VIEWER'] })
    ManageUsersApiStubber.stub.stubManageUsers()
    ManageUsersApiStubber.stub.stubManageUsersMe()
    ManageUsersApiStubber.stub.stubManageUsersMeCaseloads()
    ManageUsersApiStubber.stub.stubManageCaseloads()
    LocationsApiStubber.stub.stubPrisonConfiguration()
    cy.signIn()
  })

  it('offers the import button to a certificate viewer', () => {
    LocationsApiStubber.stub.stubCellCertificateImportsList([])

    CellCertificateImportsListPage.goTo('TST')
    Page.verifyOnPage(CellCertificateImportsListPage).newImportButton().should('exist')
  })
})

context('Cell certificate imports - a role that may not import', () => {
  beforeEach(() => {
    cy.task('reset')
    AuthStubber.stub.stubSignIn({ roles: ['MANAGE_RESIDENTIAL_LOCATIONS'] })
    ManageUsersApiStubber.stub.stubManageUsers()
    ManageUsersApiStubber.stub.stubManageUsersMe()
    ManageUsersApiStubber.stub.stubManageUsersMeCaseloads()
    ManageUsersApiStubber.stub.stubManageCaseloads()
    LocationsApiStubber.stub.stubPrisonConfiguration()
    cy.signIn()
  })

  it('cannot reach the imports page', () => {
    LocationsApiStubber.stub.stubCellCertificateImportsList([completedImport])

    cy.visit(paths.prison.cellCertificateImports('TST'), { failOnStatusCode: false })
    cy.location('pathname').should('not.eq', paths.prison.cellCertificateImports('TST'))
  })
})
