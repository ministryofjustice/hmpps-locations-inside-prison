import Page from '../../../pages/page'
import CellCertChangePage from '../../../pages/deactivate/cell-cert-change'
import { Location } from '../../../../server/data/types/locationsApi'

export default function goToCellCertChange(location: Location) {
  cy.signIn()
  cy.visit(`/location/${location.id}/deactivate`)
  return Page.verifyOnPage(CellCertChangePage)
}
