import CertChangeDisclaimerPage from '../../../../../pages/commonTransactions/certChangeDisclaimer'
import Page from '../../../../../pages/page'
import { location } from './setupStubs'
import paths from '../../../../../../server/utils/paths'

export default function goToCertChangeDisclaimer() {
  cy.signIn()
  cy.visit(paths.location.deactivate(location))

  return Page.verifyOnPage(CertChangeDisclaimerPage, 'Decreasing certified working capacity')
}
