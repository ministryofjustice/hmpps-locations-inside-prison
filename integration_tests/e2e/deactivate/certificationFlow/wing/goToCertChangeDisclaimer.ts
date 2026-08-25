import CertChangeDisclaimerPage from '../../../../pages/commonTransactions/certChangeDisclaimer'
import { location } from '../cell/setupStubs'
import paths from '../../../../../server/utils/paths'

export default function goToCertChangeDisclaimer() {
  cy.signIn()
  cy.visit(paths.location.deactivate(location))

  return new CertChangeDisclaimerPage('Deactivating a wing')
}
