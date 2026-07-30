import { location } from './setupStubs'
import Page from '../../../pages/page'
import CertChangeDisclaimerPage from '../../../pages/commonTransactions/certChangeDisclaimer'
import paths from '../../../../server/utils/paths'

export default function goToCertChangeDisclaimerPage() {
  cy.signIn()
  cy.visit(paths.location.cellConversion(location))
  return Page.verifyOnPage(CertChangeDisclaimerPage, 'Converting a non-residential room to a cell')
}
