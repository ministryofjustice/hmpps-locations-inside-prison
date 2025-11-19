import setupStubs from './setupStubs'
import Page from '../../pages/page'
import ViewLocationsIndexPage from '../../pages/viewLocations'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import CertChangeDisclaimerPage from '../../pages/commonTransactions/certChangeDisclaimer'
import goToCertChangeDisclaimer from './goToCertChangeDisclaimer'
import UpdateSignedOpCapIsUpdateNeededPage from '../../pages/commonTransactions/updateSignedOpCap/isUpdateNeeded'

context('Add To Certificate - Cert Change Disclaimer', () => {
  let page: CertChangeDisclaimerPage

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RES_LOCATIONS_OP_CAP'])
      page = goToCertChangeDisclaimer('7e570000-0000-1000-8000-000000000200')
    })

    it('continues to the next page', () => {
      page.submit()
      Page.verifyOnPage(UpdateSignedOpCapIsUpdateNeededPage)
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
