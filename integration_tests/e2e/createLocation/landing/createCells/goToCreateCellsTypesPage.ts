import Page from '../../../../pages/page'
import CreateCellsTypesPage from '../../../../pages/commonTransactions/createCells/cellTypes'
import goToCreateCellsCapacitiesPage from './goToCreateCellsCapacitiesPage'

const goToCreateCellsTypesPage = () => {
  goToCreateCellsCapacitiesPage().addCellType(0).click()

  return Page.verifyOnPage(CreateCellsTypesPage)
}
export default goToCreateCellsTypesPage
