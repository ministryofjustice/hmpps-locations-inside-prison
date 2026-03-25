import Page from '../../../../pages/page'
import ViewLocationsShowPage from '../../../../pages/viewLocations/show'
import SubmitCertificationApprovalRequestPage from '../../../../pages/commonTransactions/submitCertificationApprovalRequest'
import goToSubmitCertificationApprovalRequest from './goToSubmitCertificationApprovalRequest'
import CellCertificateChangeRequestsIndexPage from '../../../../pages/cellCertificate/changeRequests'
import { setupStubs } from './setupStubs'
import UpdateSignedOpCapDetailsPage from '../../../../pages/commonTransactions/updateSignedOpCap/details'
import UpdateSignedOpCapIsUpdateNeededPage from '../../../../pages/commonTransactions/updateSignedOpCap/isUpdateNeeded'

context('Certification Deactivation - Wing - Submit certification approval request', () => {
  let page: SubmitCertificationApprovalRequestPage

  beforeEach(() => {
    setupStubs('MANAGE_RES_LOCATIONS_OP_CAP')
  })

  context('Without a signed op cap change', () => {
    beforeEach(() => {
      page = goToSubmitCertificationApprovalRequest(false)
    })

    it('has a cancel link', () => {
      page.cancelLink().click()

      Page.verifyOnPage(ViewLocationsShowPage)
    })

    it('has a back link', () => {
      page.backLink().click()

      Page.verifyOnPage(UpdateSignedOpCapIsUpdateNeededPage)
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

  context('With a signed op cap change', () => {
    beforeEach(() => {
      page = goToSubmitCertificationApprovalRequest(true)
    })

    it('has a cancel link', () => {
      page.cancelLink().click()

      Page.verifyOnPage(ViewLocationsShowPage)
    })

    it('has a back link', () => {
      page.backLink().click()

      Page.verifyOnPage(UpdateSignedOpCapDetailsPage)
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

      Page.checkForSuccessBanner(
        'Change requests sent',
        'You have submitted 2 requests to update the cell certificate.',
      )
    })
  })
})
