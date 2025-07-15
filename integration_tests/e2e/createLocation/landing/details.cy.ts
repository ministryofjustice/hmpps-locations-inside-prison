import Page from '../../../pages/page'
import CreateLocationDetailsPage from '../../../pages/createLocation'
import ViewLocationsIndexPage from '../../../pages/viewLocations'
import LocationFactory from '../../../../server/testutils/factories/location'
import ViewLocationsShowPage from '../../../pages/viewLocations/show'

context('Set Landing Location Details', () => {
  const prisonId = 'TST'
  const residentialSummary = {
    parentLocation: LocationFactory.build({ id: '7e570000-0000-1000-8000-000000000002', pathHierarchy: 'A' }),
    subLocationName: 'Landings',
    subLocations: [LocationFactory.build({ id: '7e570000-0000-1000-8000-000000000003', pathHierarchy: 'A-ABC01' })],
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
  }

  const setupStubs = (roles = ['MANAGE_RESIDENTIAL_LOCATIONS']) => {
    cy.task('reset')
    cy.task('stubSignIn', { roles })
    cy.task('stubManageUsers')
    cy.task('stubManageUsersMe')
    cy.task('stubManageUsersMeCaseloads')
    cy.task('stubLocationsConstantsAccommodationType')
    cy.task('stubLocationsConstantsConvertedCellType')
    cy.task('stubLocationsConstantsDeactivatedReason')
    cy.task('stubLocationsConstantsLocationType')
    cy.task('stubLocationsConstantsSpecialistCellType')
    cy.task('stubLocationsConstantsUsedForType')
    cy.task('stubLocationsLocationsResidentialSummaryForLocation', residentialSummary)
    cy.task('stubLocations', residentialSummary.parentLocation)
    cy.task('setFeatureFlag', { createAndCertify: true })
    cy.task('stubGetPrisonConfiguration', { prisonId, certificationActive: true })
  }

  context('With MANAGE_RESIDENTIAL_LOCATIONS role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RESIDENTIAL_LOCATIONS'])
    })

    const goToCreateLocationDetailsPage = () => {
      cy.signIn()
      cy.visit(`/view-and-update-locations/${prisonId}/${residentialSummary.parentLocation.id}`)
      const viewLocationsIndexPage = Page.verifyOnPage(ViewLocationsIndexPage)
      viewLocationsIndexPage.locationsCreateButton().click()
      const createLocationDetailsPage = Page.verifyOnPage(CreateLocationDetailsPage)
      cy.get('h1').contains('Enter landing details')
      return createLocationDetailsPage
    }

    it('shows the correct validation error for location code when submitting non-alphanumeric characters', () => {
      const page = goToCreateLocationDetailsPage()
      page.locationCodeInput().clear().type('!@£$')
      page.createCellsNowRadio('no').click()
      page.continueButton().click()

      cy.get('.govuk-error-summary__title').contains('There is a problem')
      cy.get('.govuk-error-summary__list').contains('Landing code can only include numbers or letters')
      cy.get('#locationCode-error').contains('Landing code can only include numbers or letters')
    })

    it('shows the correct validation error for location code when submitting nothing', () => {
      const page = goToCreateLocationDetailsPage()
      page.locationCodeInput().clear()
      page.createCellsNowRadio('no').click()
      page.continueButton().click()

      cy.get('.govuk-error-summary__list').contains('Enter a landing code')
      cy.get('#locationCode-error').contains('Enter a landing code')
    })

    it('shows the correct validation error for location code when submitting more than 5 characters', () => {
      const page = goToCreateLocationDetailsPage()
      page.locationCodeInput().clear().type('thisistoolong')
      page.createCellsNowRadio('no').click()
      page.continueButton().click()

      cy.get('.govuk-error-summary__list').contains('Landing code must be 5 characters or less')
      cy.get('#locationCode-error').contains('Landing code must be 5 characters or less')
    })

    it('shows the correct validation error when submitting a code that already exists', () => {
      const page = goToCreateLocationDetailsPage()
      page.locationCodeInput().clear().type('ABC01')
      page.createCellsNowRadio('no').click()
      page.continueButton().click()

      cy.get('.govuk-error-summary__list').contains('A location with this landing code already exists')
      cy.get('#locationCode-error').contains('A location with this landing code already exists')
    })

    it('shows the correct validation error when submitting a localName that already exists', () => {
      cy.task('stubLocationsCheckLocalNameExists')
      const page = goToCreateLocationDetailsPage()
      page.locationCodeInput().clear().type('new1')
      page.localNameTextInput().clear().type('exists')
      page.createCellsNowRadio('no').click()

      page.continueButton().click()

      cy.get('.govuk-error-summary__list').contains('A location with this name already exists')
      cy.get('#localName-error').contains('A location with this name already exists')
    })

    it('shows the correct validation error when create cells has no selected value', () => {
      const page = goToCreateLocationDetailsPage()
      page.locationCodeInput().clear().type('new1')

      page.continueButton().click()

      cy.get('.govuk-error-summary__list').contains('Select yes if you want to create cells now')
      cy.get('#createCellsNow-error').contains('Select yes if you want to create cells now')
    })

    it('has a back link to the manage location page', () => {
      const page = goToCreateLocationDetailsPage()
      page.backLink().click()
      Page.verifyOnPage(ViewLocationsIndexPage)
    })

    it('has a cancel link to the view location show page', () => {
      const page = goToCreateLocationDetailsPage()
      page.cancelLink().click()
      Page.verifyOnPage(ViewLocationsShowPage)
    })

    // TODO: write tests for transition to next step
    // TODO: write tests for create cells field
  })
})
