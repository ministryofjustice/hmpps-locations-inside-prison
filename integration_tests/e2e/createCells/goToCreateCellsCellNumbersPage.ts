import Page from '../../pages/page'
import goToCreateCellsDetailsPage from './goToCreateCellsDetailsPage'
import CreateCellsCellNumbersPage from '../../pages/commonTransactions/createCells/cellNumbers'

const goToCreateCellsCellNumbersPage = () => {
  goToCreateCellsDetailsPage().submit({
    cellsToCreate: 4,
    accommodationType: 'NORMAL_ACCOMMODATION',
  })

  return Page.verifyOnPage(CreateCellsCellNumbersPage)
}
export default goToCreateCellsCellNumbersPage
