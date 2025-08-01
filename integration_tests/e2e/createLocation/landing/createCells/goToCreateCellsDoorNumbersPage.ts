import Page from '../../../../pages/page'
import CreateCellsDoorNumbersPage from '../../../../pages/commonTransactions/createCells/doorNumbers'
import goToCreateCellsCellNumbersPage from './goToCreateCellsCellNumbersPage'

const goToCreateCellsDoorNumbersPage = () => {
  goToCreateCellsCellNumbersPage().submit({
    cellNumbers: ['100', '101', '102', '103'],
  })

  return Page.verifyOnPage(CreateCellsDoorNumbersPage)
}
export default goToCreateCellsDoorNumbersPage
