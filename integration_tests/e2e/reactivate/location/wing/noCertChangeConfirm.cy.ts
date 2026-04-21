import Page from '../../../../pages/page'
import ViewLocationsShowPage from '../../../../pages/viewLocations/show'
import { setupStubs, location } from './setupStubs'
import CheckCapacityPage from '../../../../pages/reactivate/location/checkCapacity'
import NoCertChangeConfirmPage from '../../../../pages/reactivate/location/noCertChangeConfirm'
import goToNoCertChangeConfirm from '../goToNoCertChangeConfirm'

context('Certification Reactivation - Wing - No cert change confirm', () => {
  let page: NoCertChangeConfirmPage

  beforeEach(() => {
    setupStubs('MANAGE_RES_LOCATIONS_OP_CAP')

    page = goToNoCertChangeConfirm(location)
  })

  it('has a cancel link', () => {
    page.cancelLink().click()

    Page.verifyOnPage(ViewLocationsShowPage)
  })

  it('has a back link', () => {
    page.backLink().click()

    Page.verifyOnPage(CheckCapacityPage)
  })

  it('navigates to view location with a success banner on submit', () => {
    page.confirmButton().click()

    Page.verifyOnPage(ViewLocationsShowPage)
    Page.checkForSuccessBanner('Wing activated', 'You have activated wing A.')
  })
})
