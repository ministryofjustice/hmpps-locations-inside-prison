import Page from '../../../../pages/page'
import ViewLocationsShowPage from '../../../../pages/viewLocations/show'
import SubmitCertificationApprovalRequestPage from '../../../../pages/commonTransactions/submitCertificationApprovalRequest'
import goToSubmitCertificationApprovalRequest from './goToSubmitCertificationApprovalRequest'
import DeactivateTemporaryDetailsPage from '../../../../pages/deactivate/temporary/details'
import CellCertificateChangeRequestsIndexPage from '../../../../pages/cellCertificate/changeRequests'
import { setupStubs } from './setupStubs'

context('Certification Deactivation - Cell - Submit certification approval request', () => {
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

    Page.verifyOnPage(DeactivateTemporaryDetailsPage)
  })

  context('validation errors', () => {
    it('displays the correct error(s) for required', () => {
      page.submit({})

      Page.checkForError('submit-certification-approval-request_confirmation', 'Confirm changes have been agreed')
    })
  })

  it('proceeds to the requests index and displays a success banner when the form is submitted with valid data', () => {
    page.submit({
      confirm: true,
    })

    Page.verifyOnPage(CellCertificateChangeRequestsIndexPage)

    Page.checkForSuccessBanner('Change request sent', 'You have submitted a request to update the cell certificate.')
  })
})
