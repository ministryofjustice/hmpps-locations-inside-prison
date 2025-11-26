import Page from '../../pages/page'
import LocationFactory from '../../../server/testutils/factories/location'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import LocationsApiStubber from '../../mockApis/locationsApi'
import setupStubs, { existingWingLocation } from './setupStubs'
import goToEditCellsConfirmPage from './goToEditCellsConfirmPage'
import checkCellInformation from './checkCellInformation'
import EditCellsConfirmPage from '../../pages/editCells/confirm'

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
  let page: EditCellsConfirmPage

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RES_LOCATIONS_OP_CAP'])
      page = goToEditCellsConfirmPage()
    })

    it('shows the correct information and successfully creates draft landing', () => {
      LocationsApiStubber.stub.stubLocationsEditCells(newLandingLocation)
      LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation(createdLocationResidentialSummary)
      LocationsApiStubber.stub.stubLocations(newLandingLocation)

      page.cellDetailsKey(0).contains('Number of cells')
      page.cellDetailsValue(0).contains('2')

      page.cellDetailsKey(1).contains('Accommodation type')
      page.cellDetailsValue(1).contains('Normal accommodation')

      page.cellDetailsKey(2).contains('Used for')
      page.cellDetailsValue(2).contains('Close Supervision Centre (CSC)')

      checkCellInformation(page, [
        ['A-2-001', '1', '1', '2', '3', 'Biohazard / dirty protest cell', 'No'],
        ['A-2-002', '2', '2', '3', '4', '-', 'Yes'],
      ])

      page.createButton().click()

      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.successBannerHeading().contains('Cell details updated')
      viewLocationsShowPage.successBannerBody().contains('You have updated cell details for A-2.')
    })

    it('has a back link to the view location show page', () => {
      page.backLink().click()

      Page.verifyOnPage(ViewLocationsShowPage)
    })

    it('has a cancel link to the view location show page', () => {
      page.cancelLink().click()

      Page.verifyOnPage(ViewLocationsShowPage)
    })
  })
})
