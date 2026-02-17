import Page from '../../../../pages/page'
import ViewLocationsShowPage from '../../../../pages/viewLocations/show'
import CertChangeDisclaimerPage from '../../../../pages/commonTransactions/certChangeDisclaimer'
import goToCertChangeDisclaimer from '../goToCertChangeDisclaimer'
import { setupStubs, location } from './setupStubs'

context('Certification Reactivation - Landing - Cert change disclaimer', () => {
  let page: CertChangeDisclaimerPage

  beforeEach(() => {
    setupStubs('MANAGE_RES_LOCATIONS_OP_CAP')

    page = goToCertChangeDisclaimer(location)
  })

  it('has a cancel link', () => {
    page.cancelLink().click()

    Page.verifyOnPage(ViewLocationsShowPage)
  })

  it('has a back link', () => {
    page.backLink().click()

    Page.verifyOnPage(ViewLocationsShowPage)
  })

  // it('proceeds to details when the button is pressed', () => {
  //   page.continueButton().click()
  //
  //   Page.verifyOnPage(DeactivateTemporaryDetailsPage)
  // })
})
