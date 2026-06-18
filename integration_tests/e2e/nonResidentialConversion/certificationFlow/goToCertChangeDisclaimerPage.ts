import Page from '../../../pages/page'
import CertChangeDisclaimerPage from '../../../pages/commonTransactions/certChangeDisclaimer'
import { location } from './setupStubs'

export default function goToCertChangeDisclaimerPage() {
  cy.signIn()
  cy.visit(`/location/${location.id}/non-residential-conversion`)
  return Page.verifyOnPage(CertChangeDisclaimerPage, 'Converting a cell to a non-residential room')
}
