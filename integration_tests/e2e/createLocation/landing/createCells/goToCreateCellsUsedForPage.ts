import Page from '../../../../pages/page'
import goToCreateCellsCapacitiesPage from './goToCreateCellsCapacitiesPage'
import CreateCellsUsedForPage from '../../../../pages/commonTransactions/createCells/usedFor'

const goToCreateCellsUsedForPage = () => {
  goToCreateCellsCapacitiesPage().submit({
    capacities: [
      ['1', '2', '3'],
      ['1', '2', '3'],
      ['1', '2', '3'],
      ['1', '2', '3'],
    ],
  })

  return Page.verifyOnPage(CreateCellsUsedForPage)
}
export default goToCreateCellsUsedForPage
