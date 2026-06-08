import CertChangeDisclaimerPage from '../../../../../pages/commonTransactions/certChangeDisclaimer'
import Page from '../../../../../pages/page'
import { location } from './setupStubs'

export default function goToCertChangeDisclaimer() {
  cy.signIn()
  cy.visit(`/location/${location.id}/deactivate`)

  return Page.verifyOnPage(CertChangeDisclaimerPage, 'Decreasing certified working capacity')
}
