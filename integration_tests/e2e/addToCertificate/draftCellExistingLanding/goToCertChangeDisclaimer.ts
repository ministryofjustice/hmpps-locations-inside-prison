import Page from '../../../pages/page'
import ViewLocationsShowPage from '../../../pages/viewLocations/show'
import CertChangeDisclaimerPage from '../../../pages/commonTransactions/certChangeDisclaimer'
import paths from '../../../../server/utils/paths'

const goToCertChangeDisclaimer = (locationId: string) => {
  cy.signIn()

  cy.visit(paths.location.view('TST', locationId))
  Page.verifyOnPage(ViewLocationsShowPage).draftBannerCertifyButton().click()

  return new CertChangeDisclaimerPage('Adding new locations')
}

export default goToCertChangeDisclaimer
