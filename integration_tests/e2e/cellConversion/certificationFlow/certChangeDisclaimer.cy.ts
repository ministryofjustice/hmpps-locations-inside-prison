import goToCertChangeDisclaimerPage from './goToCertChangeDisclaimerPage'
import setupStubs from './setupStubs'
import Page from '../../../pages/page'
import ViewLocationsShowPage from '../../../pages/viewLocations/show'
import CertChangeDisclaimerPage from '../../../pages/commonTransactions/certChangeDisclaimer'
import CellConversionAccommodationTypePage from '../../../pages/cellConversion/accommodationType'

context('Cell conversion - Cert change disclaimer', () => {
  let page: CertChangeDisclaimerPage

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RES_LOCATIONS_OP_CAP'])
      page = goToCertChangeDisclaimerPage()
    })

    it('continues to the next page', () => {
      page.submit()
      Page.verifyOnPage(CellConversionAccommodationTypePage)
    })

    it('has a back link to the view location show page', () => {
      page.backLink().click()
      Page.verifyOnPage(ViewLocationsShowPage)
    })

    it('has a cancel link to the view location show page', () => {
      page.cancelLink().click()
      Page.verifyOnPage(ViewLocationsShowPage)
    })
  })
})
