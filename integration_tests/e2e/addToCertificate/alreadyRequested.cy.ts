import setupStubs from './setupStubs'
import Page from '../../pages/page'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import CertChangeDisclaimerPage from '../../pages/commonTransactions/certChangeDisclaimer'
import UpdateSignedOpCapAlreadyRequestedPage from '../../pages/commonTransactions/updateSignedOpCap/alreadyRequested'
import goToUpdateSignedOpCapAlreadyRequested from './goToUpdateSignedOpCapAlreadyRequested'
import SubmitCertificationApprovalRequestPage from '../../pages/commonTransactions/submitCertificationApprovalRequest'

context('Add To Certificate - Update Signed Operational Capacity - Already Requested', () => {
  let page: UpdateSignedOpCapAlreadyRequestedPage

  context('With MANAGE_RESIDENTIAL_LOCATIONS role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RESIDENTIAL_LOCATIONS'], { proposedOpCap: true })
      page = goToUpdateSignedOpCapAlreadyRequested('7e570000-0000-1000-8000-000000000200')
    })

    it('continues to the next page', () => {
      page.submit()
      Page.verifyOnPage(SubmitCertificationApprovalRequestPage)
    })

    it('has a back link to cert change disclaimer', () => {
      page.backLink().click()
      Page.verifyOnPage(CertChangeDisclaimerPage)
    })

    it('has a cancel link to the view location show page', () => {
      page.cancelLink().click()
      Page.verifyOnPage(ViewLocationsShowPage)
    })
  })
})
