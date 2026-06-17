import { location } from './setupStubs'
import Page from '../../../pages/page'
import CertChangeDisclaimerPage from '../../../pages/commonTransactions/certChangeDisclaimer'

export default function goToCertChangeDisclaimerPage() {
  cy.signIn()
  cy.visit(`/location/${location.id}/cell-conversion`)
  return Page.verifyOnPage(CertChangeDisclaimerPage, 'Converting a non-residential room to a cell')
}
