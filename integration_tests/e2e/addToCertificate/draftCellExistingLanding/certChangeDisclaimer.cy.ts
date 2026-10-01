import setupStubs, { draftCell } from './setupStubs'
import Page from '../../../pages/page'
import ViewLocationsIndexPage from '../../../pages/viewLocations'
import ViewLocationsShowPage from '../../../pages/viewLocations/show'
import CertChangeDisclaimerPage from '../../../pages/commonTransactions/certChangeDisclaimer'
import goToCertChangeDisclaimer from './goToCertChangeDisclaimer'
import SubmitCertificationApprovalRequestPage from '../../../pages/commonTransactions/submitCertificationApprovalRequest'

context('Add To Certificate - Draft Cell Existing Landing - Cert Change Disclaimer', () => {
  let page: CertChangeDisclaimerPage

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RES_LOCATIONS_OP_CAP'])
      page = goToCertChangeDisclaimer(draftCell.id)
    })

    it('continues to the next page', () => {
      page.submit()
      Page.verifyOnPage(SubmitCertificationApprovalRequestPage)
    })

    it('has a back link to the manage location page', () => {
      page.backLink().click()
      Page.verifyOnPage(ViewLocationsIndexPage)
    })

    it('has a cancel link to the view location show page', () => {
      page.cancelLink().click()
      Page.verifyOnPage(ViewLocationsShowPage)
    })
  })
})
