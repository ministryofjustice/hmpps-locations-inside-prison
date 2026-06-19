import setupStubs from './setupStubs'
import Page from '../../../pages/page'
import ViewLocationsShowPage from '../../../pages/viewLocations/show'
import CellConversionCertFlowSanitationPage from '../../../pages/cellConversion/certificationFlow/sanitation'
import SubmitCertificationApprovalRequestPage from '../../../pages/commonTransactions/submitCertificationApprovalRequest'
import CellCertificateChangeRequestsIndexPage from '../../../pages/cellCertificate/changeRequests'
import goToSubmitCertificationApprovalRequestPage from './goToSubmitCertificationApprovalRequestPage'

context('Cell conversion - Cert flow - Submit certification approval request', () => {
  let page: SubmitCertificationApprovalRequestPage

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RES_LOCATIONS_OP_CAP'])
      page = goToSubmitCertificationApprovalRequestPage()
    })

    it('has a back link to the previous step', () => {
      page.backLink().click()
      Page.verifyOnPage(CellConversionCertFlowSanitationPage)
    })

    it('has a cancel link to the view location show page', () => {
      page.cancelLink().click()
      Page.verifyOnPage(ViewLocationsShowPage)
    })

    it('shows the correct title', () => {
      cy.get('h1').contains('You are requesting a change to the cell certificate')
    })

    it('shows a validation error when the confirmation checkbox is not checked', () => {
      page.submit({})

      Page.checkForError(
        'submit-certification-approval-request_confirmation',
        'Confirm that the cells meet the certification standards',
      )
    })

    it('submits and redirects to change requests on success', () => {
      page.submit({ confirm: true })

      Page.verifyOnPage(CellCertificateChangeRequestsIndexPage)
      Page.checkForSuccessBanner('Change request sent', 'You have submitted a request to update the cell certificate.')
    })
  })
})
