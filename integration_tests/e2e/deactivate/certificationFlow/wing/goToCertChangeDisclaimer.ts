import CertChangeDisclaimerPage from '../../../../pages/commonTransactions/certChangeDisclaimer'
import { location } from '../cell/setupStubs'

export default function goToCertChangeDisclaimer() {
  cy.signIn()
  cy.visit(`/location/${location.id}/deactivate`)

  return new CertChangeDisclaimerPage('Deactivating a wing')
}
