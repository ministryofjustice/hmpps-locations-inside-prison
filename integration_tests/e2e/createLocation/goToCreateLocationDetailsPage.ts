import Page from '../../pages/page'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import CreateLocationDetailsPage from '../../pages/createLocation'
import paths from '../../../server/utils/paths'

const goToCreateLocationDetailsPage = (locationId?: string, signIn = true) => {
  if (signIn) {
    cy.signIn()
  }

  cy.visit(paths.location.view('TST', locationId))
  const viewLocationsIndexPage = Page.verifyOnPage(ViewLocationsShowPage)

  viewLocationsIndexPage.locationsCreateButton().click()

  return Page.verifyOnPage(CreateLocationDetailsPage)
}

export default goToCreateLocationDetailsPage
