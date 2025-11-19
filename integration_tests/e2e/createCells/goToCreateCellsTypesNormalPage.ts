import Page from '../../pages/page'
import CreateCellsTypesNormalPage from '../../pages/commonTransactions/createCells/normalCellTypes'
import goToCreateCellsTypesPage from './goToCreateCellsTypesPage'

const goToCreateCellsTypeNormalPage = () => {
  const selectTypePage = goToCreateCellsTypesPage()

  selectTypePage.normalAccommodationType().click()
  selectTypePage.continueButton().click()

  return Page.verifyOnPage(CreateCellsTypesNormalPage)
}
export default goToCreateCellsTypeNormalPage
