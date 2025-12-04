import Page from '../../pages/page'
import goToCreateCellsBulkSanitationPage from './goToCreateCellsBulkSanitationPage'
import CreateCellsWithoutSanitationPage from '../../pages/commonTransactions/createCells/withoutSanitation'

const goToCreateCellsWithoutSanitationPage = () => {
  goToCreateCellsBulkSanitationPage().submit({ bulkSanitation: false })

  return Page.verifyOnPage(CreateCellsWithoutSanitationPage)
}
export default goToCreateCellsWithoutSanitationPage
