import Page from '../../pages/page'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import SubmitCertificationApprovalRequestPage from '../../pages/commonTransactions/submitCertificationApprovalRequest'
import goToSubmitCertificationApprovalRequest from './goToSubmitCertificationApprovalRequest'
import CellCertificateChangeRequestsIndexPage from '../../pages/cellCertificate/changeRequests'
import { setupStubs } from './setupStubs'
import CertChangeDisclaimerPage from '../../pages/commonTransactions/certChangeDisclaimer'

context('Working Capacity Mismatch - Submit certification approval request', () => {
  let page: SubmitCertificationApprovalRequestPage

  beforeEach(() => {
    setupStubs('MANAGE_RES_LOCATIONS_OP_CAP')
    page = goToSubmitCertificationApprovalRequest()
  })

  it('has a cancel link', () => {
    page.cancelLink().click()

    Page.verifyOnPage(ViewLocationsShowPage)
  })

  it('has a back link', () => {
    page.backLink().click()

    Page.verifyOnPage(CertChangeDisclaimerPage, 'Changing the cell’s capacity')
  })

  context('validation errors', () => {
    it('displays the correct error(s) for required', () => {
      page.submit({})

      Page.checkForError(
        'submit-certification-approval-request_confirmation',
        'Confirm that the cells meet the certification standards',
      )
    })
  })

  it('proceeds to the requests index and displays a success banner when the form is submitted with valid data', () => {
    page.submit({ confirm: true })

    Page.verifyOnPage(CellCertificateChangeRequestsIndexPage)

    Page.checkForSuccessBanner('Change request sent', 'You have submitted a request to update the cell certificate.')
  })
})
