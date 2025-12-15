import Page from '../../pages/page'
import CreateCellsDetailsPage from '../../pages/commonTransactions/createCells/details'

const goToCreateCellsDetailsPage = () => {
  cy.signIn()
  cy.visit('/create-cells/7e570000-0000-1000-8000-000000000003')

  return Page.verifyOnPage(CreateCellsDetailsPage)
}

export default goToCreateCellsDetailsPage
