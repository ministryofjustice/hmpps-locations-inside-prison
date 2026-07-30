import Page from '../../../pages/page'
import EditCellsConfirmPage from '../../../pages/editCells/confirm'
import { landing } from './setupStubs'
import paths from '../../../../server/utils/paths'

const goToEditCellsConfirmPage = () => {
  cy.signIn()
  cy.visit(paths.location.editCells(landing))

  return Page.verifyOnPage(EditCellsConfirmPage)
}
export default goToEditCellsConfirmPage
