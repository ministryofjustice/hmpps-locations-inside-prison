import Page from '../../pages/page'
import CreateCellsCapacitiesPage from '../../pages/commonTransactions/createCells/capacities'
import goToCreateCellsDoorNumbersPage from './goToCreateCellsDoorNumbersPage'

const goToCreateCellsCapacitiesPage = () => {
  goToCreateCellsDoorNumbersPage().submit({
    doorNumbers: ['1', '2', '3', '4'],
  })

  return Page.verifyOnPage(CreateCellsCapacitiesPage)
}
export default goToCreateCellsCapacitiesPage
