import Page from '../../../../pages/page'
import CellCertChangePage from '../../../../pages/deactivate/cell-cert-change'
import { location } from './setupStubs'

export default function goToCellCertChange() {
  cy.signIn()
  cy.visit(`/location/${location.id}/deactivate`)
  return Page.verifyOnPage(CellCertChangePage)
}
