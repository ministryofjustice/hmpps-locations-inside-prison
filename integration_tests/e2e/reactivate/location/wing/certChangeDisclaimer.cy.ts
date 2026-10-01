import Page from '../../../../pages/page'
import ViewLocationsShowPage from '../../../../pages/viewLocations/show'
import CertChangeDisclaimerPage from '../../../../pages/commonTransactions/certChangeDisclaimer'
import goToCertChangeDisclaimer from '../goToCertChangeDisclaimer'
import { setupStubs, location } from './setupStubs'
import CheckCapacityPage from '../../../../pages/reactivate/location/checkCapacity'
import SubmitCertificationApprovalRequestPage from '../../../../pages/commonTransactions/submitCertificationApprovalRequest'

context('Certification Reactivation - Wing - Cert change disclaimer', () => {
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

    Page.verifyOnPage(CheckCapacityPage)
  })

  it('proceeds to certification approval on submit', () => {
    page.submit()

    Page.verifyOnPage(SubmitCertificationApprovalRequestPage)
  })
})
