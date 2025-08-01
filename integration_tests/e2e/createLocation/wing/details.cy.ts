import Page from '../../../pages/page'
import CreateLocationDetailsPage from '../../../pages/createLocation'
import ViewLocationsIndexPage from '../../../pages/viewLocations'
import LocationsApiStubber from '../../../mockApis/locationsApi'
import setupStubs from './setupStubs'
import goToCreateLocationDetailsPage from '../goToCreateLocationDetailsPage'

context('Create Wing Details', () => {
  let page: CreateLocationDetailsPage

  context('With MANAGE_RESIDENTIAL_LOCATIONS role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RESIDENTIAL_LOCATIONS'])
      page = goToCreateLocationDetailsPage()
    })

    it('shows the correct validation error for location code when submitting non-alphanumeric characters', () => {
      page.submit({
        locationCode: '!@£$',
      })

      page.checkForError('locationCode', 'Wing code can only include numbers or letters')
    })

    it('shows the correct validation error for location code when submitting nothing', () => {
      page.submit({})

      page.checkForError('locationCode', 'Enter a wing code')
    })

    it('shows the correct validation error for location code when submitting more than 5 characters', () => {
      page.submit({
        locationCode: 'thisistoolong',
      })

      page.checkForError('locationCode', 'Wing code must be 5 characters or less')
    })

    it('shows the correct validation error when submitting a code that already exists', () => {
      page.submit({
        locationCode: 'A',
      })

      page.checkForError('locationCode', 'A location with this wing code already exists')
    })

    it('shows the correct validation error when submitting a localName that already exists', () => {
      LocationsApiStubber.stub.stubLocationsPrisonLocalName({ exists: true })

      page.submit({
        locationCode: 'new1',
        localName: 'exists',
      })

      page.checkForError('localName', 'A location with this name already exists')
    })

    it('has a back link to the manage location page', () => {
      page.backLink().click()

      Page.verifyOnPage(ViewLocationsIndexPage)
    })

    it('has a cancel link to the view location index page', () => {
      page.cancelLink().click()

      Page.verifyOnPage(ViewLocationsIndexPage)
    })
  })
})
