import Page from '../../pages/page'
import EditCellsConfirmPage from '../../pages/editCells/confirm'

const goToEditCellsConfirmPage = () => {
  cy.signIn()
  cy.visit('/edit-cells/7e570000-0000-1000-8000-000000000003')

  return Page.verifyOnPage(EditCellsConfirmPage)
}
export default goToEditCellsConfirmPage
