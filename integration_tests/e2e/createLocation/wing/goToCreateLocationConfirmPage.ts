import Page from '../../../pages/page'
import CreateLocationConfirmPage from '../../../pages/createLocation/confirm'
import goToCreateLocationWingStructurePage from './goToCreateLocationWingStructurePage'

const goToCreateLocationConfirmPage = () => {
  goToCreateLocationWingStructurePage().submit()

  return Page.verifyOnPage(CreateLocationConfirmPage)
}

export default goToCreateLocationConfirmPage
