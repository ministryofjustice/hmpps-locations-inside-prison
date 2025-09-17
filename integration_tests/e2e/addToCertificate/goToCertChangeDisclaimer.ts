import Page from '../../pages/page'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import CertChangeDisclaimerPage from '../../pages/commonTransactions/certChangeDisclaimer'

const goToCertChangeDisclaimer = (locationId: string) => {
  cy.signIn()

  cy.visit(`/view-and-update-locations/TST/${locationId}`)
  Page.verifyOnPage(ViewLocationsShowPage).draftBannerCertifyButton().click()

  return Page.verifyOnPage(CertChangeDisclaimerPage)
}

export default goToCertChangeDisclaimer
