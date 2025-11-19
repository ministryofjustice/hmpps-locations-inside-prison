import Page from '../../pages/page'
import CreateLocationConfirmPage from '../../pages/createLocation/confirm'
import goToCreateCellsWithoutSanitationPage from './goToCreateCellsWithoutSanitationPage'

const goToCreateCellsConfirmPage = () => {
  goToCreateCellsWithoutSanitationPage().submit({ withoutSanitation: [0, 2] })

  return Page.verifyOnPage(CreateLocationConfirmPage)
}
export default goToCreateCellsConfirmPage
