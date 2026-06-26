import Page from '../../../pages/page'
import EditCellsConfirmPage from '../../../pages/editCells/confirm'
import { landing } from './setupStubs'

const goToEditCellsConfirmPage = () => {
  cy.signIn()
  cy.visit(`/edit-cells/${landing.id}`)

  return Page.verifyOnPage(EditCellsConfirmPage)
}
export default goToEditCellsConfirmPage
