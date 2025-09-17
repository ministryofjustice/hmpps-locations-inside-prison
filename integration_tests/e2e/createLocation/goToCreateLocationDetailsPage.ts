import Page from '../../pages/page'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import CreateLocationDetailsPage from '../../pages/createLocation'

const goToCreateLocationDetailsPage = (locationId?: string, signIn = true) => {
  if (signIn) {
    cy.signIn()
  }

  cy.visit(`/view-and-update-locations/TST${locationId ? `/${locationId}` : ''}`)
  const viewLocationsIndexPage = Page.verifyOnPage(ViewLocationsShowPage)

  viewLocationsIndexPage.locationsCreateButton().click()

  return Page.verifyOnPage(CreateLocationDetailsPage)
}

export default goToCreateLocationDetailsPage
