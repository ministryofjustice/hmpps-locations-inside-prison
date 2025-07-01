import LocationFactory from '../../../server/testutils/factories/location'
import Page from '../../pages/page'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import SetLocalNamePage from '../../pages/setLocalName'

context('Set local name', () => {
  const locationAsWing = LocationFactory.build({
    accommodationTypes: ['NORMAL_ACCOMMODATION'],
    capacity: { maxCapacity: 2, workingCapacity: 1 },
    leafLevel: false,
    locationType: 'WING',
    localName: '',
    specialistCellTypes: ['ACCESSIBLE_CELL', 'CONSTANT_SUPERVISION'],
    usedFor: ['STANDARD_ACCOMMODATION', 'TEST_TYPE'],
  })

  const updatedLocationAsWing = { ...locationAsWing, localName: 'New Local Name' }

  const locationAsCell = {
    ...locationAsWing,
    leafLevel: true,
    localName: '1-1-001',
  }

  const setupStubs = (roles = ['VIEW_INTERNAL_LOCATION']) => {
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
    cy.task('stubLocationsLocationsResidentialSummaryForLocation', { parentLocation: locationAsWing })
    cy.task('stubLocations', locationAsWing)
    cy.task('stubGetPrisonConfiguration', { prisonId: 'TST', certificationActive: 'ACTIVE' })
  }

  context('Without MANAGE_RESIDENTIAL_LOCATIONS role', () => {
    beforeEach(() => setupStubs())

    it('does not show change/set links on the show location page', () => {
      cy.signIn()
      ViewLocationsShowPage.goTo(locationAsWing.prisonId, locationAsWing.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.cellUsedForDetails().should('exist')
      viewLocationsShowPage.changeCellUsedForLink().should('not.exist')
    })
  })

  context('With MANAGE_RESIDENTIAL_LOCATIONS role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RESIDENTIAL_LOCATIONS'])
      cy.signIn()
    })

    it('shows the add local name link on the show location page', () => {
      ViewLocationsShowPage.goTo(locationAsWing.prisonId, locationAsWing.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.setLocalNameLink().should('exist')
    })

    it('does not show the add local name link on a cell-level page', () => {
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', { parentLocation: locationAsCell })
      cy.task('stubLocations', locationAsCell)
      ViewLocationsShowPage.goTo(locationAsCell.prisonId, locationAsCell.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.setLocalNameLink().should('not.exist')
    })

    it('allows accessing the add local name page from a parent level', () => {
      ViewLocationsShowPage.goTo(locationAsWing.prisonId, locationAsWing.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.setLocalNameLink().click()
      Page.verifyOnPage(SetLocalNamePage)
    })

    it('has a back link to the show location page', () => {
      ViewLocationsShowPage.goTo(locationAsWing.prisonId, locationAsWing.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.setLocalNameLink().click()
      Page.verifyOnPage(SetLocalNamePage).backLink().click()
      Page.verifyOnPage(ViewLocationsShowPage)
    })

    it('has a cancel link', () => {
      ViewLocationsShowPage.goTo(locationAsWing.prisonId, locationAsWing.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.setLocalNameLink().click()
      Page.verifyOnPage(SetLocalNamePage).cancelLink().click()
      Page.verifyOnPage(ViewLocationsShowPage)
    })

    it('shows validation error when no local name is set', () => {
      cy.task('stubLocationsCheckLocalNameDoesntExist', {
        localName: null,
        updatedBy: 'TEST_USER',
      })
      ViewLocationsShowPage.goTo(locationAsWing.prisonId, locationAsWing.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.setLocalNameLink().click()
      Page.verifyOnPage(SetLocalNamePage).saveLocalNameButton().click()

      cy.get('.govuk-error-summary__title').contains('There is a problem')
      cy.get('.govuk-error-summary__list').contains('Enter a local name')
    })

    it('shows validation error when local name exceeds 30 characters', () => {
      cy.task('stubLocationsCheckLocalNameDoesntExist', {
        localName: '1234567890123456789012345678901',
        updatedBy: 'TEST_USER',
      })
      ViewLocationsShowPage.goTo(locationAsWing.prisonId, locationAsWing.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.setLocalNameLink().click()
      const setLocalNamePage = Page.verifyOnPage(SetLocalNamePage)
      setLocalNamePage.localNameTextInput().click().type('1234567890123456789012345678901')
      setLocalNamePage.saveLocalNameButton().click()

      cy.get('.govuk-error-summary__title').contains('There is a problem')
      cy.get('.govuk-error-message').contains('Local name must be 30 characters or less')
      cy.get('.govuk-error-message').contains('You have 1 character too many')
    })

    it('shows validation error when local name already exists', () => {
      cy.task('stubLocationsCheckLocalNameExists')
      cy.task('stubUpdateLocalName', {
        localName: 'new local name',
        updatedBy: 'TEST_USER',
      })
      ViewLocationsShowPage.goTo(locationAsWing.prisonId, locationAsWing.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.setLocalNameLink().click()
      Page.verifyOnPage(SetLocalNamePage).localNameTextInput().click().type('new local name')
      Page.verifyOnPage(SetLocalNamePage).saveLocalNameButton().click()

      cy.get('.govuk-error-summary__title').contains('There is a problem')
      cy.get('.govuk-error-message').contains('A location with this name already exists')
    })

    it('shows success banner when setting a local name is complete', () => {
      cy.task('stubLocationsCheckLocalNameDoesntExist', { prisonId: 'TST', localName: 'new local name' })
      cy.task('stubUpdateLocalName', {
        localName: 'new local name',
        updatedBy: 'TEST_USER',
      })
      ViewLocationsShowPage.goTo(locationAsWing.prisonId, locationAsWing.id)
      cy.task('stubLocations', updatedLocationAsWing)
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', { parentLocation: updatedLocationAsWing })

      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.setLocalNameLink().click()
      Page.verifyOnPage(SetLocalNamePage).localNameTextInput().click().type('new local name')
      Page.verifyOnPage(SetLocalNamePage).saveLocalNameButton().click()

      Page.verifyOnPage(ViewLocationsShowPage)
      cy.get('#govuk-notification-banner-title').should('contain', 'Success')
      cy.get('.govuk-notification-banner__content h3').should('contain', 'Local name added')
      cy.get('.govuk-notification-banner__content p').should('contain', 'You have added a local name.')
      cy.get('.govuk-heading-l').should('contain', 'New Local Name')
    })
  })
})
