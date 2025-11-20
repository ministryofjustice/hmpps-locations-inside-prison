import Page from '../../pages/page'
import goToCreateCellsUsedForPage from './goToCreateCellsUsedForPage'
import CreateCellsBulkSanitationPage from '../../pages/commonTransactions/createCells/bulkSanitation'

const goToCreateCellsBulkSanitationPage = () => {
  goToCreateCellsUsedForPage().submit({ usedFor: ['STANDARD_ACCOMMODATION', 'FIRST_NIGHT_CENTRE'] })

  return Page.verifyOnPage(CreateCellsBulkSanitationPage)
}
export default goToCreateCellsBulkSanitationPage
