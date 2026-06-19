import setupStubs from './setupStubs'
import Page from '../../../pages/page'
import ViewLocationsShowPage from '../../../pages/viewLocations/show'
import CertChangeDisclaimerPage from '../../../pages/commonTransactions/certChangeDisclaimer'
import NonResidentialConversionDetailsPage from '../../../pages/nonResidentialConversion/details'
import goToCertChangeDisclaimerPage from './goToCertChangeDisclaimerPage'

context('Non-residential conversion - Cert flow - Cert change disclaimer', () => {
  let page: CertChangeDisclaimerPage

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs()
      page = goToCertChangeDisclaimerPage()
    })

    it('continues to the details page', () => {
      page.submit()

      Page.verifyOnPage(NonResidentialConversionDetailsPage)
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
