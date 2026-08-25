import Page from '../../../../pages/page'
import CellCertChangePage from '../../../../pages/deactivate/cell-cert-change'
import { location } from './setupStubs'
import paths from '../../../../../server/utils/paths'

export default function goToCellCertChange() {
  cy.signIn()
  cy.visit(paths.location.deactivate(location))
  return Page.verifyOnPage(CellCertChangePage)
}
