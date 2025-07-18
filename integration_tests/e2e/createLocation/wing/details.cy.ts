import Page from '../../../pages/page'
import CreateLocationDetailsPage from '../../../pages/createLocation'
import ViewLocationsIndexPage from '../../../pages/viewLocations'
import LocationFactory from '../../../../server/testutils/factories/location'

context('Set Wing Location Details', () => {
  const prisonId = 'TST'
  const residentialSummary = {
    prisonSummary: {
      workingCapacity: 8,
      signedOperationalCapacity: 10,
      maxCapacity: 9,
    },
    subLocationName: 'TestWings',
    active: true,
    subLocations: [LocationFactory.build({ id: '7e570000-0000-1000-8000-000000000002', pathHierarchy: 'ABC01' })],
    topLevelLocationType: 'Wings',
    locationHierarchy: [],
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
    cy.task('stubLocationsLocationsResidentialSummary', residentialSummary)
    cy.task('setFeatureFlag', { createAndCertify: true })
    cy.task('stubGetPrisonConfiguration', { prisonId, certificationActive: true })
  }

  context('With MANAGE_RESIDENTIAL_LOCATIONS role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RESIDENTIAL_LOCATIONS'])
    })

    const goToCreateLocationDetailsPage = () => {
      cy.signIn()
      cy.visit(`/view-and-update-locations/${prisonId}`)
      const viewLocationsIndexPage = Page.verifyOnPage(ViewLocationsIndexPage)
      viewLocationsIndexPage.locationsCreateButton().click()
      return Page.verifyOnPage(CreateLocationDetailsPage)
    }

    it('shows the correct validation error for location code when submitting non-alphanumeric characters', () => {
      const page = goToCreateLocationDetailsPage()

      page.locationCodeInput().clear().type('!@£$')
      page.continueButton().click()

      cy.get('.govuk-error-summary__title').contains('There is a problem')
      cy.get('.govuk-error-summary__list').contains('Testwing code can only include numbers or letters')
      cy.get('#locationCode-error').contains('Testwing code can only include numbers or letters')
    })

    it('shows the correct validation error for location code when submitting nothing', () => {
      const page = goToCreateLocationDetailsPage()
      page.locationCodeInput().clear()
      page.continueButton().click()

      cy.get('.govuk-error-summary__list').contains('Enter a testwing code')
      cy.get('#locationCode-error').contains('Enter a testwing code')
    })

    it('shows the correct validation error for location code when submitting more than 5 characters', () => {
      const page = goToCreateLocationDetailsPage()
      page.locationCodeInput().clear().type('thisistoolong')
      page.continueButton().click()

      cy.get('.govuk-error-summary__list').contains('Testwing code must be 5 characters or less')
      cy.get('#locationCode-error').contains('Testwing code must be 5 characters or less')
    })

    it('shows the correct validation error when submitting a code that already exists', () => {
      const page = goToCreateLocationDetailsPage()
      page.locationCodeInput().clear().type('ABC01')
      page.continueButton().click()

      cy.get('.govuk-error-summary__list').contains('A location with this testwing code already exists')
      cy.get('#locationCode-error').contains('A location with this testwing code already exists')
    })

    it('shows the correct validation error when submitting a localName that already exists', () => {
      cy.task('stubLocationsCheckLocalNameExists')
      const page = goToCreateLocationDetailsPage()
      page.locationCodeInput().clear().type('new1')
      page.localNameTextInput().clear().type('exists')

      page.continueButton().click()

      cy.get('.govuk-error-summary__list').contains('A location with this name already exists')
      cy.get('#localName-error').contains('A location with this name already exists')
    })

    it('has a back link to the manage location page', () => {
      const page = goToCreateLocationDetailsPage()
      page.backLink().click()
      Page.verifyOnPage(ViewLocationsIndexPage)
    })

    it('has a cancel link to the view location index page', () => {
      const page = goToCreateLocationDetailsPage()
      page.cancelLink().click()
      Page.verifyOnPage(ViewLocationsIndexPage)
    })
  })
})
