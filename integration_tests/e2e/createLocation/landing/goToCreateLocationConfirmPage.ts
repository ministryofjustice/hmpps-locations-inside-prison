import Page from '../../../pages/page'
import CreateLocationConfirmPage from '../../../pages/createLocation/confirm'
import goToCreateLocationDetailsPage from '../goToCreateLocationDetailsPage'

const goToCreateLocationConfirmPage = () => {
  const detailsPage = goToCreateLocationDetailsPage('7e570000-0000-1000-8000-000000000002')
  detailsPage.locationCodeInput().clear().type('2')
  detailsPage.localNameTextInput().clear().type('testL')
  detailsPage.createCellsNowRadio('NO').click()

  detailsPage.continueButton().click()

  return Page.verifyOnPage(CreateLocationConfirmPage)
}

export default goToCreateLocationConfirmPage
