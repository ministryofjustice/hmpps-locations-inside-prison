import Page from '../../pages/page'
import CreateCellsTypesSpecialPage from '../../pages/commonTransactions/createCells/specialCellTypes'
import goToCreateCellsTypesPage from './goToCreateCellsTypesPage'

const goToCreateCellsTypeSpecialPage = () => {
  const selectTypePage = goToCreateCellsTypesPage()

  selectTypePage.specialAccommodationType().click()
  selectTypePage.continueButton().click()

  return Page.verifyOnPage(CreateCellsTypesSpecialPage)
}
export default goToCreateCellsTypeSpecialPage
