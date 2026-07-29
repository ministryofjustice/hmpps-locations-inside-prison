import Page from '../../../pages/page'
import CellCertificateUploadsListPage from '../../../pages/admin/ingest/list'
import CellCertificateUploadDetailPage from '../../../pages/admin/ingest/detail'
import { CellCertificateUpload } from '../../../../server/data/types/locationsApi/cellCertificateUpload'
import paths from '../../../../server/utils/paths'
import ManageUsersApiStubber from '../../../mockApis/manageUsersApi'
import AuthStubber from '../../../mockApis/auth'
import LocationsApiStubber from '../../../mockApis/locationsApi'

const completedUpload: CellCertificateUpload = {
  id: 'upload-1',
  prisonId: 'TST',
  status: 'FINISHED',
  totalRecords: 2,
  processedRecords: 1,
  skippedRecords: 1,
  failedRecords: 0,
  requestedBy: 'USER1',
  requestedDate: '2024-01-01T10:00:00',
  startTime: '2024-01-01T10:00:05',
  endTime: '2024-01-01T10:01:00',
  cellCertificateId: 'cert-1',
  locations: [
    {
      locationKey: 'TST-A-1-001',
      status: 'PROCESSED',
      maxCapacity: 2,
      workingCapacity: 1,
      certifiedNormalAccommodation: 2,
      previousMaxCapacity: 2,
      previousWorkingCapacity: 2,
      previousCertifiedNormalAccommodation: 2,
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

const inProgressUpload: CellCertificateUpload = {
  id: 'upload-2',
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

context('Cell certificate uploads', () => {
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

  it('lists completed uploads and drills into the detail with a cell certificate link', () => {
    LocationsApiStubber.stub.stubCellCertificateUploadsList([completedUpload])
    LocationsApiStubber.stub.stubCellCertificateUpload(completedUpload)
    CellCertificateUploadsListPage.goTo('TST')
    const listPage = Page.verifyOnPage(CellCertificateUploadsListPage)
    listPage.uploadNewButton().should('exist')
    listPage.uploadsTable().should('contain', 'Complete')

    listPage.firstUploadLink().click()

    const detailPage = Page.verifyOnPage(CellCertificateUploadDetailPage)
    detailPage.summary().should('contain', 'Complete')
    detailPage.summary().should('contain', 'USER1')
    detailPage.locationsTable().should('contain', 'TST-A-1-001')
    detailPage.locationsTable().should('contain', '2 → 1')
    detailPage.locationsTable().should('contain', 'No changes required')
    detailPage.cellCertificateLink().should('have.attr', 'href', paths.cellCertificate.view('TST', 'cert-1'))
  })

  it('hides the upload button and shows a message while an upload is in progress', () => {
    LocationsApiStubber.stub.stubCellCertificateUploadsList([inProgressUpload])

    CellCertificateUploadsListPage.goTo('TST')
    const listPage = Page.verifyOnPage(CellCertificateUploadsListPage)
    listPage.inProgressMessage().should('exist')
    listPage.uploadNewButton().should('not.exist')
    listPage.uploadsTable().should('contain', 'Processing')
  })

  it('shows the in-progress message on the detail page for an unfinished upload', () => {
    LocationsApiStubber.stub.stubCellCertificateUpload(inProgressUpload)

    cy.visit(`${paths.admin.ingestCert('TST')}/upload/upload-2`)
    const detailPage = Page.verifyOnPage(CellCertificateUploadDetailPage)
    detailPage.inProgressMessage().should('exist')
    detailPage.cellCertificateLink().should('not.exist')
    detailPage.summary().should('contain', 'Processing')
  })

  it('shows a message when there are no uploads', () => {
    LocationsApiStubber.stub.stubCellCertificateUploadsList([])

    CellCertificateUploadsListPage.goTo('TST')
    const listPage = Page.verifyOnPage(CellCertificateUploadsListPage)
    listPage.noUploadsMessage().should('exist')
    listPage.uploadNewButton().should('exist')
  })
})
