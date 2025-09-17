import Page from '../../../pages/page'
import CreateLocationStructurePage from '../../../pages/createLocation/structure'
import goToCreateLocationDetailsPage from '../goToCreateLocationDetailsPage'

export default function goToCreateLocationWingStructurePage() {
  goToCreateLocationDetailsPage().submit({
    locationCode: 'B',
    localName: 'testW',
  })

  return Page.verifyOnPage(CreateLocationStructurePage)
}
