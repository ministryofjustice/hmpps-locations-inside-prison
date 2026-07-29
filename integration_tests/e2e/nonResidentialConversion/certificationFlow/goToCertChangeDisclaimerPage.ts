import Page from '../../../pages/page'
import CertChangeDisclaimerPage from '../../../pages/commonTransactions/certChangeDisclaimer'
import { location } from './setupStubs'
import paths from '../../../../server/utils/paths'

export default function goToCertChangeDisclaimerPage() {
  cy.signIn()
  cy.visit(paths.location.nonResidentialConversion(location))
  return Page.verifyOnPage(CertChangeDisclaimerPage, 'Converting a cell to a non-residential room')
}
