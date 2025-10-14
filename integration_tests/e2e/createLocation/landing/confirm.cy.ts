import Page from '../../../pages/page'
import CreateLocationDetailsPage from '../../../pages/createLocation/index'
import ViewLocationsIndexPage from '../../../pages/viewLocations'
import LocationFactory from '../../../../server/testutils/factories/location'
import CreateLocationConfirmPage from '../../../pages/createLocation/confirm'
import ViewLocationsShowPage from '../../../pages/viewLocations/show'
import LocationsApiStubber from '../../../mockApis/locationsApi'
import setupStubs, { existingWingLocation } from './setupStubs'
import goToCreateLocationConfirmPage from './goToCreateLocationConfirmPage'

context('Create Landing Confirm', () => {
  const newLandingLocation = LocationFactory.build({
    id: '7e570000-0000-1000-8000-000000000004',
    pathHierarchy: 'A-2',
    parentId: '7e570000-0000-1000-8000-000000000003',
    locationType: 'LANDING',
    status: 'DRAFT',
    localName: 'testL',
  })
  const createdLocationResidentialSummary = {
    parentLocation: newLandingLocation,
    subLocationName: 'Cells',
    subLocations: [],
    topLevelLocationType: 'Wings',
    locationHierarchy: [
      {
        id: existingWingLocation.id,
        prisonId: existingWingLocation.prisonId,
        code: existingWingLocation.code,
        type: existingWingLocation.locationType,
        pathHierarchy: existingWingLocation.pathHierarchy,
        level: 1,
      },
      {
        id: newLandingLocation.id,
        prisonId: newLandingLocation.prisonId,
        code: newLandingLocation.code,
        type: newLandingLocation.locationType,
        pathHierarchy: newLandingLocation.pathHierarchy,
        level: 1,
      },
    ],
    wingStructure: [],
  }
  let page: CreateLocationConfirmPage

  context('With MANAGE_RESIDENTIAL_LOCATIONS role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RESIDENTIAL_LOCATIONS'])
      page = goToCreateLocationConfirmPage()
    })

    it('shows the correct information and successfully creates draft landing', () => {
      setupStubs(['MANAGE_RESIDENTIAL_LOCATIONS'])
      LocationsApiStubber.stub.stubLocationsCreateCells(newLandingLocation)
      LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation(createdLocationResidentialSummary)
      LocationsApiStubber.stub.stubLocations(newLandingLocation)

      page.detailsTitle().contains('Landing details')
      page
        .changeDetailsLink(0)
        .should('have.attr', 'href')
        .and('include', `/create-new/${existingWingLocation.id}/details`)

      page.changeDetailsKey(0).contains('Landing code')
      page.changeDetailsValue(0).contains('2')

      page.changeDetailsKey(1).contains('Local name')
      page.changeDetailsValue(1).contains('testL')

      page.changeDetailsKey(2).contains('Create cells on landing now')
      page.changeDetailsValue(2).contains('No')
      page.createButton().click()

      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.successBannerHeading().contains('Landing created')
      viewLocationsShowPage.draftBanner().should('exist')
      viewLocationsShowPage.summaryCards.cnaText().contains('-')
      viewLocationsShowPage.summaryCards.workingCapacityText().contains('-')
      viewLocationsShowPage.summaryCards.maximumCapacityText().contains('-')
      viewLocationsShowPage.locationDetailsRows().eq(0).contains('A-2')
      viewLocationsShowPage.locationDetailsRows().eq(1).contains('testL')
    })

    it('has a back link to the enter details page', () => {
      page.backLink().click()

      Page.verifyOnPage(CreateLocationDetailsPage)
    })

    it('has a cancel link to the view location index page', () => {
      page.cancelLink().click()

      Page.verifyOnPage(ViewLocationsIndexPage)
    })
  })
})
