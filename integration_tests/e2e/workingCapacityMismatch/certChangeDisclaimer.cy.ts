import Page from '../../pages/page'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import CertChangeDisclaimerPage from '../../pages/commonTransactions/certChangeDisclaimer'
import goToCertChangeDisclaimer from './goToCertChangeDisclaimer'
import { setupStubs } from './setupStubs'
import UpdateSignedOpCapIsUpdateNeededPage from '../../pages/commonTransactions/updateSignedOpCap/isUpdateNeeded'
import WorkingCapacityMismatchDetails from '../../pages/workingCapacityMismatch/details'

context('Working Capacity Mismatch - Cert change disclaimer', () => {
  let page: CertChangeDisclaimerPage

  beforeEach(() => {
    setupStubs('MANAGE_RES_LOCATIONS_OP_CAP')

    page = goToCertChangeDisclaimer()
  })

  it('has a cancel link', () => {
    page.cancelLink().click()

    Page.verifyOnPage(ViewLocationsShowPage)
  })

  it('has a back link', () => {
    page.backLink().click()

    Page.verifyOnPage(WorkingCapacityMismatchDetails)
  })

  it('proceeds to update signed op cap on submit', () => {
    page.submit()

    Page.verifyOnPage(UpdateSignedOpCapIsUpdateNeededPage)
  })
})
