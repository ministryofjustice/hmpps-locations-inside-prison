import Page from '../../pages/page'
import CreateCellsDetailsPage from '../../pages/commonTransactions/createCells/details'
import paths from '../../../server/utils/paths'

const goToCreateCellsDetailsPage = () => {
  cy.signIn()
  cy.visit(paths.location.createCells('TST', '7e570000-0000-1000-8000-000000000003'))

  return Page.verifyOnPage(CreateCellsDetailsPage)
}

export default goToCreateCellsDetailsPage
