import Page from '../../../pages/page'
import CreateLocationDetailsPage from '../../../pages/createLocation'
import ViewLocationsIndexPage from '../../../pages/viewLocations'
import ViewLocationsShowPage from '../../../pages/viewLocations/show'
import LocationsApiStubber from '../../../mockApis/locationsApi'
import setupStubs from './setupStubs'
import goToCreateLocationDetailsPage from '../goToCreateLocationDetailsPage'
import LocationFactory from '../../../../server/testutils/factories/location'
import { LocationResidentialSummary } from '../../../../server/data/types/locationsApi'

const residentialSummaryWithoutCellChild: LocationResidentialSummary = {
  parentLocation: LocationFactory.build({
    id: '7e570000-0000-1000-8000-000000000002',
    pathHierarchy: 'A',
    parentId: undefined,
    locationType: 'WING',
    localName: undefined,
  }),
  subLocationName: 'Spurs',
  subLocations: [LocationFactory.build({ id: '7e570000-0000-1000-8000-000000000003', pathHierarchy: 'A-1' })],
  topLevelLocationType: 'Wings',
  locationHierarchy: [
    {
      id: '7e570000-0000-1000-8000-000000000001',
      prisonId: 'TST',
      code: '1',
      type: 'WING',
      pathHierarchy: '1',
      level: 1,
    },
  ],
  wingStructure: ['WING', 'SPUR', 'LANDING', 'CELL'],
}

context('Create Landing Details', () => {
  let page: CreateLocationDetailsPage

  context('With MANAGE_RESIDENTIAL_LOCATIONS role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RESIDENTIAL_LOCATIONS'])
      page = goToCreateLocationDetailsPage('7e570000-0000-1000-8000-000000000002')
    })

    it('shows the correct validation error for location code when submitting non-alphanumeric characters', () => {
      page.submit({
        locationCode: '!@£$',
        createCellsNow: false,
      })

      page.checkForError('locationCode', 'Landing code can only include numbers or letters')
    })

    it('shows the correct validation error for location code when submitting nothing', () => {
      page.submit({
        createCellsNow: false,
      })

      page.checkForError('locationCode', 'Enter a landing code')
    })

    it('shows the correct validation error for location code when submitting more than 5 characters', () => {
      page.submit({
        locationCode: 'thisistoolong',
        createCellsNow: false,
      })

      page.checkForError('locationCode', 'Landing code must be 5 characters or less')
    })

    it('shows the correct validation error when submitting a code that already exists', () => {
      page.submit({
        locationCode: '1',
        createCellsNow: false,
      })

      page.checkForError('locationCode', 'A location with this landing code already exists')
    })

    it('shows the correct validation error when submitting a local name that already exists', () => {
      LocationsApiStubber.stub.stubLocationsPrisonLocalName({
        exists: true,
        locationId: '7e570000-0000-1000-8000-000000000002',
      })

      page.submit({
        locationCode: 'new1',
        localName: 'exists',
        createCellsNow: false,
      })

      page.checkForError('localName', 'A location with this name already exists')
    })

    it('shows the correct validation error for local name when submitting more than 30 characters', () => {
      page.submit({
        locationCode: 'new1',
        localName: 'thisistoolongthisistoolongthisistoolong',
        createCellsNow: false,
      })

      page.checkForError('localName', 'Local name must be 30 characters or less')
    })

    it('shows the correct validation error when create cells has no selected value', () => {
      page.submit({
        locationCode: 'new1',
      })

      page.checkForError('createCellsNow', 'Select yes if you want to create cells now')
    })

    it('does not show create cells for non-cell child type', () => {
      setupStubs(['MANAGE_RESIDENTIAL_LOCATIONS'])
      LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation(residentialSummaryWithoutCellChild)
      page = goToCreateLocationDetailsPage('7e570000-0000-1000-8000-000000000002', false)

      page.createCellsNowRadio('NO').should('not.exist')
    })

    it('has a back link to the manage location page', () => {
      page.backLink().click()
      Page.verifyOnPage(ViewLocationsIndexPage)
    })

    it('has a cancel link to the view location show page', () => {
      page.cancelLink().click()
      Page.verifyOnPage(ViewLocationsShowPage)
    })

    // TODO: write tests for transition to next step
    // TODO: write tests for create cells field
  })
})
