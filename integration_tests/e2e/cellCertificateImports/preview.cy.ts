import Page from '../../pages/page'
import CellCertificateImportPreviewPage from '../../pages/cellCertificateImports/preview'
import CellCertificateImportDetailPage from '../../pages/cellCertificateImports/detail'
import CellCertificateImportsListPage from '../../pages/cellCertificateImports/list'
import { CellCertificateImport } from '../../../server/data/types/locationsApi/cellCertificateImport'
import paths from '../../../server/utils/paths'
import ManageUsersApiStubber from '../../mockApis/manageUsersApi'
import AuthStubber from '../../mockApis/auth'
import LocationsApiStubber from '../../mockApis/locationsApi'

const csv = [
  'Wing,Cell no,Cell mark,CNA,Max Cap,Working Cap,Cell type,In cell sanitation',
  'A,TST-A-1-001,A1-01,2,3,2,Normal Accommodation,TRUE',
  'A,TST-A-1-002,A1-02,1,1,1,Normal Accommodation,TRUE',
].join('\n')

const finishedPreview: CellCertificateImport = {
  id: 'preview-1',
  prisonId: 'TST',
  status: 'FINISHED',
  mode: 'PREVIEW',
  totalRecords: 2,
  processedRecords: 1,
  skippedRecords: 1,
  failedRecords: 0,
  discrepancyRecords: 0,
  notOnCertificateRecords: 1,
  requestedBy: 'USER1',
  requestedDate: '2026-10-01T10:00:00',
  startTime: '2026-10-01T10:00:05',
  endTime: '2026-10-01T10:01:00',
  currentCertificateTotals: { maxCapacity: 10, workingCapacity: 9, certifiedNormalAccommodation: 8 },
  projectedCertificateTotals: { maxCapacity: 11, workingCapacity: 9, certifiedNormalAccommodation: 8 },
  locations: [
    {
      locationKey: 'TST-A-1-001',
      status: 'PROCESSED',
      maxCapacity: 3,
      workingCapacity: 2,
      certifiedNormalAccommodation: 2,
      previousMaxCapacity: 2,
      previousWorkingCapacity: 2,
      previousCertifiedNormalAccommodation: 2,
      appliedMaxCapacity: 3,
      appliedWorkingCapacity: 2,
    },
    {
      locationKey: 'TST-A-1-002',
      status: 'SKIPPED',
      message: 'No changes required',
      maxCapacity: 1,
      workingCapacity: 1,
      certifiedNormalAccommodation: 1,
    },
  ],
  locationsNotOnCertificate: [
    {
      locationKey: 'TST-A-1-003',
      locationId: '7e570000-0000-0000-0000-000000000099',
      maxCapacity: 2,
      workingCapacity: 2,
      certifiedNormalAccommodation: 2,
    },
  ],
}

const startedImport: CellCertificateImport = {
  id: 'import-2',
  prisonId: 'TST',
  status: 'STARTED',
  mode: 'IMPORT',
  previewUploadId: 'preview-1',
  totalRecords: 2,
  processedRecords: 0,
  skippedRecords: 0,
  failedRecords: 0,
  requestedBy: 'USER1',
  requestedDate: '2026-10-01T10:05:00',
  startTime: '2026-10-01T10:05:01',
  locations: [],
}

context('Cell certificate import preview', () => {
  beforeEach(() => {
    cy.task('reset')
    AuthStubber.stub.stubSignIn({ roles: ['MANAGE_RES_LOCATIONS_ADMIN'] })
    ManageUsersApiStubber.stub.stubManageUsers()
    ManageUsersApiStubber.stub.stubManageUsersMe()
    ManageUsersApiStubber.stub.stubManageUsersMeCaseloads()
    ManageUsersApiStubber.stub.stubManageCaseloads()
    LocationsApiStubber.stub.stubPrisonConfiguration()
    LocationsApiStubber.stub.stubCellCertificateImportsList([])
    LocationsApiStubber.stub.stubCellCertificateImport(finishedPreview)
    cy.signIn()
  })

  const uploadAndPreview = () => {
    LocationsApiStubber.stub.stubRequestCellCertificatePreview({ ...finishedPreview, status: 'PENDING' })

    cy.visit(`${paths.prison.cellCertificateImports('TST')}/new`)
    // the GOV.UK file upload hides the input behind its drop zone
    cy.get('input[type=file]').selectFile(
      { contents: Cypress.Buffer.from(csv), fileName: 'certificate.csv', mimeType: 'text/csv' },
      { force: true },
    )
    cy.get('button').contains('Upload').click()

    cy.get('h1').should('contain', 'Check cell certificate data')
    cy.get('button').contains('Preview import').click()
  }

  it('previews an import without changing anything, then continues it', () => {
    uploadAndPreview()

    const previewPage = Page.verifyOnPage(CellCertificateImportPreviewPage)
    previewPage.previewMessage().should('contain', 'Nothing has been changed yet')
    previewPage
      .summary()
      .should('contain', 'Will change')
      .and('contain', 'Cells that would be added to the certificate')

    // what the import would do, cell by cell
    previewPage.locationsTable().contains('tr', 'TST-A-1-001').should('contain', 'Will change').and('contain', '2 → 3')
    previewPage.locationsTable().contains('tr', 'TST-A-1-002').should('contain', 'No change')
    previewPage
      .locationsTable()
      .contains('tr', 'TST-A-1-003')
      .should('contain', 'Would be added')
      .and('contain', 'Not on the uploaded file. Would be added')
    previewPage.notOnCertificateAlert().should('contain', 'but would be added to the new cell certificate')

    // and to the certificate as a whole
    previewPage.totalsTable().contains('tr', 'Max capacity').should('contain', '10').and('contain', '11')

    LocationsApiStubber.stub.stubContinueCellCertificatePreview(startedImport)
    LocationsApiStubber.stub.stubCellCertificateImportById(startedImport)
    previewPage.continueButton().click()

    const importPage = Page.verifyOnPage(CellCertificateImportDetailPage)
    cy.get('.govuk-notification-banner').should('contain', 'Cell certificate import started')
    importPage.inProgressMessage().should('contain', 'This cell certificate is still being processed')
  })

  it('shows cells carried forward from the current certificate, and certificate changes for cells in the file', () => {
    LocationsApiStubber.stub.stubCellCertificateImport({
      ...finishedPreview,
      notOnCertificateRecords: 2,
      carriedForwardRecords: 1,
      locations: [
        {
          locationKey: 'TST-A-1-002',
          status: 'SKIPPED',
          message: 'No changes required',
          maxCapacity: 2,
          workingCapacity: 2,
          certifiedNormalAccommodation: 2,
          previousMaxCapacity: 2,
          previousWorkingCapacity: 2,
          previousCertifiedNormalAccommodation: 2,
          currentCertifiedMaxCapacity: 2,
          currentCertifiedWorkingCapacity: 1,
          currentCertifiedNormalAccommodation: 2,
        },
      ],
      locationsNotOnCertificate: [
        {
          locationKey: 'TST-A-1-003',
          locationId: '7e570000-0000-0000-0000-000000000099',
          maxCapacity: 2,
          workingCapacity: 1,
          certifiedNormalAccommodation: 2,
          onCurrentCertificate: true,
        },
        {
          locationKey: 'TST-A-1-004',
          locationId: '7e570000-0000-0000-0000-000000000098',
          maxCapacity: 2,
          workingCapacity: 2,
          certifiedNormalAccommodation: 2,
          onCurrentCertificate: false,
        },
      ],
    })

    cy.visit(`${paths.prison.cellCertificateImports('TST')}/import/preview-1`)
    const previewPage = Page.verifyOnPage(CellCertificateImportPreviewPage)

    previewPage.summary().should('contain', 'Cells that would be carried forward')
    cy.get('[data-qa=carried-forward-message]').should('contain', '1 cell(s) are not on the uploaded file')
    previewPage
      .notOnCertificateAlert()
      .should('contain', '1 cell(s) are not on the uploaded file or the current cell certificate')
    previewPage
      .locationsTable()
      .contains('tr', 'TST-A-1-003')
      .should('contain', 'Would be carried forward')
      .and('contain', 'carried forward unchanged from the current cell certificate')
    previewPage.locationsTable().contains('tr', 'TST-A-1-004').should('contain', 'Would be added')
    // 'No change' to Residential locations, but the certificate changes
    previewPage
      .locationsTable()
      .contains('tr', 'TST-A-1-002')
      .should('contain', 'No change')
      .find('[data-qa=certificate-change]')
      .should('contain', 'Certificate: working capacity 1 → 2')
  })

  it('points a mistyped cell name at the cell it most likely meant', () => {
    LocationsApiStubber.stub.stubCellCertificateImport({
      ...finishedPreview,
      failedRecords: 1,
      notOnCertificateRecords: 1,
      locations: [
        {
          locationKey: 'TST-A-1-5',
          status: 'FAILED',
          message: 'Location not found on Residential locations',
          maxCapacity: 2,
          workingCapacity: 2,
          certifiedNormalAccommodation: 2,
          suggestedLocationKey: 'TST-A-1-005',
        },
      ],
      locationsNotOnCertificate: [
        {
          locationKey: 'TST-A-1-005',
          locationId: '7e570000-0000-0000-0000-000000000097',
          maxCapacity: 2,
          workingCapacity: 2,
          certifiedNormalAccommodation: 2,
          uploadedAsKey: 'TST-A-1-5',
        },
      ],
    })

    cy.visit(`${paths.prison.cellCertificateImports('TST')}/import/preview-1`)
    const previewPage = Page.verifyOnPage(CellCertificateImportPreviewPage)

    // match the Location column exactly: the other row's Details also mention TST-A-1-5
    previewPage
      .locationsTable()
      .find('tbody tr')
      .filter((_, row: HTMLTableRowElement) => row.cells[0].innerText.trim() === 'TST-A-1-5')
      .should('have.length', 1)
      .and('contain', 'Will fail')
      .find('[data-qa=location-suggestion]')
      .should('contain', 'Did you mean TST-A-1-005?')
    previewPage
      .locationsTable()
      .contains('tr', 'TST-A-1-005')
      .find('[data-qa=location-suggestion]')
      .should('contain', 'Possibly listed in the file as TST-A-1-5')
  })

  it('cancels a preview without importing anything', () => {
    uploadAndPreview()

    Page.verifyOnPage(CellCertificateImportPreviewPage).cancelLink().click()

    Page.verifyOnPage(CellCertificateImportsListPage)
  })

  it('explains why a preview cannot be continued', () => {
    uploadAndPreview()
    LocationsApiStubber.stub.stubContinueCellCertificatePreview({
      status: 409,
      errorCode: 149,
      userMessage:
        'A cell certificate import has finished for this prison since this preview was run. Run the preview again before importing.',
    })

    Page.verifyOnPage(CellCertificateImportPreviewPage).continueButton().click()

    Page.verifyOnPage(CellCertificateImportPreviewPage)
    cy.get('.govuk-error-summary').should('contain', 'Run the preview again before importing.')
  })

  it('links a continued preview to its import instead of offering to continue again', () => {
    LocationsApiStubber.stub.stubCellCertificateImport({ ...finishedPreview, continuedAsUploadId: 'import-2' })

    cy.visit(`${paths.prison.cellCertificateImports('TST')}/import/preview-1`)

    const previewPage = Page.verifyOnPage(CellCertificateImportPreviewPage)
    previewPage.continueButton().should('not.exist')
    previewPage
      .continuedImportLink()
      .should('have.attr', 'href', `${paths.prison.cellCertificateImports('TST')}/import/import-2`)
  })
})
