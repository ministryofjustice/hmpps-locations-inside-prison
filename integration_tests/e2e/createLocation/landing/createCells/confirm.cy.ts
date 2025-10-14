import Page from '../../../../pages/page'
import LocationFactory from '../../../../../server/testutils/factories/location'
import ViewLocationsShowPage from '../../../../pages/viewLocations/show'
import LocationsApiStubber from '../../../../mockApis/locationsApi'
import setupStubs, { existingWingLocation } from '../setupStubs'
import goToCreateCellsConfirmPage from './goToCreateCellsConfirmPage'
import CreateLocationConfirmPage from '../../../../pages/createLocation/confirm'
import CreateCellsWithoutSanitationPage from '../../../../pages/commonTransactions/createCells/withoutSanitation'
import checkCellInformation from './checkCellInformation'

context('Create Landing - Create cells - Confirm', () => {
  const newLandingLocation = LocationFactory.build({
    id: '7e570000-0000-1000-8000-000000000004',
    pathHierarchy: 'A-2',
    parentId: '7e570000-0000-1000-8000-000000000003',
    locationType: 'LANDING',
    status: 'DRAFT',
    localName: 'testL',
    numberOfCellLocations: 4,
    pendingChanges: {
      certifiedNormalAccommodation: 4,
      workingCapacity: 8,
      maxCapacity: 12,
    },
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
      page = goToCreateCellsConfirmPage()
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
      page.changeDetailsValue(0).contains('A-2')

      page.changeDetailsKey(1).contains('Local name')
      page.changeDetailsValue(1).contains('testL')

      page.changeDetailsKey(2).should('not.exist')

      page.cellDetailsKey(0).contains('Number of cells')
      page.cellDetailsValue(0).contains('4')

      page.cellDetailsKey(1).contains('Accommodation type')
      page.cellDetailsValue(1).contains('Normal accommodation')

      page.cellDetailsKey(2).contains('Used for')
      page.cellDetailsValue(2).contains('First night centre / Induction')
      page.cellDetailsValue(2).contains('Standard accommodation')

      checkCellInformation(page, [
        ['A-2-100', '1', '1', '2', '3', 'Accessible cell', 'No'],
        ['A-2-101', '2', '1', '2', '3', '-', 'Yes'],
        ['A-2-102', '3', '1', '2', '3', '-', 'No'],
        ['A-2-103', '4', '1', '2', '3', '-', 'Yes'],
      ])

      page.createButton().click()

      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.successBannerHeading().contains('Locations created')
      viewLocationsShowPage.successBannerBody().contains('You have created landing testL with 4 cells.')
      viewLocationsShowPage.draftBanner().should('exist')
      viewLocationsShowPage.summaryCards.cnaText().contains('4')
      viewLocationsShowPage.summaryCards.workingCapacityText().contains('8')
      viewLocationsShowPage.summaryCards.maximumCapacityText().contains('12')
      viewLocationsShowPage.locationDetailsRows().eq(0).contains('A-2')
      viewLocationsShowPage.locationDetailsRows().eq(1).contains('testL')
    })

    it('has a back link to the without sanitation page', () => {
      page.backLink().click()

      Page.verifyOnPage(CreateCellsWithoutSanitationPage)
    })

    it('has a cancel link to the view location show page', () => {
      page.cancelLink().click()

      Page.verifyOnPage(ViewLocationsShowPage)
    })
  })
})
