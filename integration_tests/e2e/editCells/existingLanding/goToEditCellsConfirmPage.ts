import Page from '../../../pages/page'
import EditCellsConfirmPage from '../../../pages/editCells/confirm'
import paths from '../../../../server/utils/paths'

const goToEditCellsConfirmPage = () => {
  cy.signIn()
  cy.visit(paths.location.editCells('TST', '7e570000-0000-1000-8000-000000000110'))

  return Page.verifyOnPage(EditCellsConfirmPage)
}
export default goToEditCellsConfirmPage
