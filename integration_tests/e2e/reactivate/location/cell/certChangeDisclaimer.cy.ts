import Page from '../../../../pages/page'
import ViewLocationsShowPage from '../../../../pages/viewLocations/show'
import CertChangeDisclaimerPage from '../../../../pages/commonTransactions/certChangeDisclaimer'
import goToCertChangeDisclaimer from '../goToCertChangeDisclaimer'
import { setupStubs, location } from './setupStubs'
import CheckCapacityPage from '../../../../pages/reactivate/location/checkCapacity'

context('Certification Reactivation - Cell - Cert change disclaimer', () => {
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

  it('proceeds to check capacity on submit', () => {
    page.submit()

    Page.verifyOnPage(CheckCapacityPage)
  })
})
