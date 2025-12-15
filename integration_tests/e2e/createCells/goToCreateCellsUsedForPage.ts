import Page from '../../pages/page'
import CreateCellsUsedForPage from '../../pages/commonTransactions/createCells/usedFor'
import goToCreateCellsTypesNormalPage from './goToCreateCellsTypesNormalPage'
import CreateCellsCapacitiesPage from '../../pages/commonTransactions/createCells/capacities'

const goToCreateCellsUsedForPage = () => {
  goToCreateCellsTypesNormalPage().submit({ cellType: ['ACCESSIBLE_CELL'] })

  const page = Page.verifyOnPage(CreateCellsCapacitiesPage)
  page.submit({
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
