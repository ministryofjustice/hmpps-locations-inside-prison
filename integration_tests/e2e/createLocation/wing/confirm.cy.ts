import Page from '../../../pages/page'
import CreateLocationStructurePage from '../../../pages/createLocation/structure'
import ViewLocationsIndexPage from '../../../pages/viewLocations'
import LocationFactory from '../../../../server/testutils/factories/location'
import ViewLocationsShowPage from '../../../pages/viewLocations/show'
import LocationsApiStubber from '../../../mockApis/locationsApi'
import setupStubs, { existingWingLocation } from './setupStubs'
import goToCreateLocationConfirmPage from './goToCreateLocationConfirmPage'

context('Create Wing Confirm', () => {
  const newWingLocation = LocationFactory.build({
    id: '7e570000-0000-1000-8000-000000000003',
    pathHierarchy: 'B',
    parentId: undefined,
    locationType: 'WING',
    status: 'DRAFT',
    localName: 'testW',
  })
  const createdLocationResidentialSummary = {
    parentLocation: newWingLocation,
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
    ],
  }

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RES_LOCATIONS_OP_CAP'])
    })

    it('shows the correct information and successfully creates draft wing', () => {
      LocationsApiStubber.stub.stubLocationsCreateWing(newWingLocation)
      LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation(createdLocationResidentialSummary)
      LocationsApiStubber.stub.stubLocations(newWingLocation)

      const page = goToCreateLocationConfirmPage()

      page.detailsTitle().contains('Wing details')

      page.detailsAdditionalText().contains('You can add landings and cells to the wing once it is created.')

      page.changeDetailsKey(0).contains('Wing code')
      page.changeDetailsValue(0).contains('B')
      page.changeDetailsLink(0).should('have.attr', 'href').and('include', '/create-new/TST/details')

      page.changeDetailsKey(1).contains('Local name')
      page.changeDetailsValue(1).contains('testW')
      page.changeDetailsLink(1).should('have.attr', 'href').and('include', '/create-new/TST/details')

      page.changeDetailsKey(2).contains('Wing structure')
      page.changeDetailsValue(2).contains('Wing → Landings → Cells')
      page.changeDetailsLink(2).should('have.attr', 'href').and('include', '/create-new/TST/structure')

      page.createButton().click()

      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.successBannerHeading().contains('Wing created')
      viewLocationsShowPage.draftBanner().should('exist')
      viewLocationsShowPage.summaryCards.cnaText().contains('-')
      viewLocationsShowPage.summaryCards.workingCapacityText().contains('-')
      viewLocationsShowPage.summaryCards.maximumCapacityText().contains('-')
      viewLocationsShowPage.locationDetailsRows().eq(0).contains('B')
      viewLocationsShowPage.locationDetailsRows().eq(1).contains('testW')
      viewLocationsShowPage.changeLocalNameLink().should('exist')
      viewLocationsShowPage.changeCellUsedForLink().should('exist')
    })

    it('has a back link to the enter details page', () => {
      const page = goToCreateLocationConfirmPage()
      page.backLink().click()
      Page.verifyOnPage(CreateLocationStructurePage)
    })

    it('has a cancel link to the view location index page', () => {
      const page = goToCreateLocationConfirmPage()
      page.cancelLink().click()
      Page.verifyOnPage(ViewLocationsIndexPage)
    })
  })
})
