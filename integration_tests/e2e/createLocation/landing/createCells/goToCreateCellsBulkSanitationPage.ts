import Page from '../../../../pages/page'
import goToCreateCellsUsedForPage from './goToCreateCellsUsedForPage'
import CreateCellsBulkSanitationPage from '../../../../pages/commonTransactions/createCells/bulkSanitation'

const goToCreateCellsBulkSanitationPage = () => {
  goToCreateCellsUsedForPage().submit()

  return Page.verifyOnPage(CreateCellsBulkSanitationPage)
}
export default goToCreateCellsBulkSanitationPage
