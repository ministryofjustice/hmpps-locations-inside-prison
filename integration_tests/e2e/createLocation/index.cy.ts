import Page from '../../pages/page'
import CreateLocationDetailsPage from '../../pages/createLocation/index'
import ManageLocationsIndexPage from '../../pages/manageLocations'
import buildDecoratedLocation from '../../../server/testutils/buildDecoratedLocation'
import LocationFactory from '../../../server/testutils/factories/location'

context('Set Wing Location Details', () => {
  const prisonId = 'TST'

  const locationAsWing = LocationFactory.build({
    accommodationTypes: [],
    capacity: {},
    leafLevel: false,
    locationType: 'WING',
    localName: '',
    specialistCellTypes: [],
    usedFor: [],
    pathHierarchy: '',
  })

  const decorated = buildDecoratedLocation({ ...locationAsWing, locationType: 'WING' })

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
    cy.task('stubLocationsLocationsResidentialSummary')
    cy.task('stubLocations', decorated)
    cy.task('setFeatureFlag', { createAndCertify: true })
    cy.task('stubGetPrisonConfiguration', { prisonId: 'TST', certificationActive: true })
  }

  context('With MANAGE_RESIDENTIAL_LOCATIONS role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RESIDENTIAL_LOCATIONS'])
    })

    const goToCreateLocationDetailsPage = () => {
      cy.signIn()
      cy.visit(`/manage-locations/${prisonId}`)
      const manageLocationsIndexPage = Page.verifyOnPage(ManageLocationsIndexPage)
      manageLocationsIndexPage.locationsCreateWingButton().click()
      CreateLocationDetailsPage.goTo(prisonId)
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
      cy.task('stubLocationsResidentialHierarchy', {
        prisonId: 'TST',
        residentialHierarchy: [
          {
            locationId: '123',
            locationType: 'WING',
            locationCode: 'ABC01',
            fullLocationPath: 'A-ABC01',
            localName: 'A Wing',
            level: 1,
            status: 'ACTIVE',
            subLocations: [],
          },
        ],
      })
      const page = goToCreateLocationDetailsPage()
      page.locationCodeInput().clear().type('ABC01')
      page.continueButton().click()

      cy.get('.govuk-error-summary__list').contains('A location with this testwing code already exists')
      cy.get('#locationCode-error').contains('A location with this testwing code already exists')
    })

    it('shows the correct validation error when submitting a localName that already exists', () => {
      cy.task('stubLocationsResidentialHierarchy', {
        prisonId: 'TST',
        residentialHierarchy: [
          {
            locationId: '123',
            locationType: 'WING',
            locationCode: 'ABC01',
            fullLocationPath: 'A-ABC01',
            localName: 'A Wing',
            level: 1,
            status: 'ACTIVE',
            subLocations: [],
          },
        ],
      })
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
      Page.verifyOnPage(ManageLocationsIndexPage)
    })

    it('has a cancel link to the manage location page', () => {
      const page = goToCreateLocationDetailsPage()
      page.cancelLink().click()
      Page.verifyOnPage(ManageLocationsIndexPage)
    })
  })
})
