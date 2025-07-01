import LocationFactory from '../../../server/testutils/factories/location'
import Page from '../../pages/page'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import ChangeLocalNamePage from '../../pages/changeLocalName'

context('change local name', () => {
  const locationAsWing = LocationFactory.build({
    accommodationTypes: ['NORMAL_ACCOMMODATION'],
    capacity: { maxCapacity: 2, workingCapacity: 1 },
    leafLevel: false,
    locationType: 'WING',
    localName: 'Local Name',
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

  describe('without the MANAGE_RESIDENTIAL_LOCATIONS role', () => {
    beforeEach(() => {
      setupStubs(['VIEW_INTERNAL_LOCATION'])
    })

    it('does not show the change/set links on the show location page', () => {
      cy.signIn()
      ViewLocationsShowPage.goTo(locationAsWing.prisonId, locationAsWing.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.cellUsedForDetails().should('exist')
      viewLocationsShowPage.changeCellUsedForLink().should('not.exist')
    })
  })

  describe('with the MANAGE_RESIDENTIAL_LOCATIONS role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RESIDENTIAL_LOCATIONS'])
      cy.signIn()
    })

    it('shows the change local name link on the show location page', () => {
      ViewLocationsShowPage.goTo(locationAsWing.prisonId, locationAsWing.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.changeLocalNameLink().should('exist')
    })

    it('does not show the change local name link on a cell level', () => {
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', { parentLocation: locationAsCell })
      cy.task('stubLocations', locationAsCell)
      ViewLocationsShowPage.goTo(locationAsCell.prisonId, locationAsCell.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.localNameRow().should('not.exist')
    })

    it('shows the change local name link on a parent level and can be accessed', () => {
      ViewLocationsShowPage.goTo(locationAsWing.prisonId, locationAsWing.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.changeLocalNameLink().click()
      Page.verifyOnPage(ChangeLocalNamePage)
    })

    it('has a back link to the show location page', () => {
      ViewLocationsShowPage.goTo(locationAsWing.prisonId, locationAsWing.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.changeLocalNameLink().click()
      const changeLocalNamePage = Page.verifyOnPage(ChangeLocalNamePage)
      changeLocalNamePage.backLink().click()
      Page.verifyOnPage(ViewLocationsShowPage)
    })

    it('has a cancel link', () => {
      ViewLocationsShowPage.goTo(locationAsWing.prisonId, locationAsWing.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.changeLocalNameLink().click()
      const changeLocalNamePage = Page.verifyOnPage(ChangeLocalNamePage)
      changeLocalNamePage.cancelLink().click()
      Page.verifyOnPage(ViewLocationsShowPage)
    })

    it('shows the local name prepopulated in the text area', () => {
      ViewLocationsShowPage.goTo(locationAsWing.prisonId, locationAsWing.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.changeLocalNameLink().click()
      const changeLocalNamePage = Page.verifyOnPage(ChangeLocalNamePage)
      changeLocalNamePage.localNameTextInput().contains('Local Name')
    })

    it('shows the correct validation error when no local name is set', () => {
      cy.task('stubLocationsCheckLocalNameDoesntExist', {
        localName: null,
        updatedBy: 'TEST_USER',
      })
      ViewLocationsShowPage.goTo(locationAsWing.prisonId, locationAsWing.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.changeLocalNameLink().click()
      const changeLocalNamePage = Page.verifyOnPage(ChangeLocalNamePage)
      changeLocalNamePage.localNameTextInput().clear()
      changeLocalNamePage.saveLocalNameButton().click()
      cy.get('.govuk-error-summary__title').contains('There is a problem')
      cy.get('.govuk-error-summary__list').contains('Enter a local name')
    })

    it('shows the correct validation error when local name is over 30 characters', () => {
      cy.task('stubLocationsCheckLocalNameDoesntExist', {
        localName: '1234567890123456789012345678901',
        updatedBy: 'TEST_USER',
      })
      ViewLocationsShowPage.goTo(locationAsWing.prisonId, locationAsWing.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.changeLocalNameLink().click()
      const changeLocalNamePage = Page.verifyOnPage(ChangeLocalNamePage)
      changeLocalNamePage.localNameTextInput().clear()
      changeLocalNamePage.localNameTextInput().click().type('1234567890123456789012345678901')
      changeLocalNamePage.saveLocalNameButton().click()

      cy.get('.govuk-error-summary__title').contains('There is a problem')
      cy.get('.govuk-error-message').contains('Local name must be 30 characters or less')
      cy.get('.govuk-error-message').contains('You have 1 character too many')
    })

    it('shows the correct validation error when there is a matching local name', () => {
      cy.task('stubLocationsCheckLocalNameExists')
      cy.task('stubUpdateLocalName', {
        localName: 'changed local name',
        updatedBy: 'TEST_USER',
      })
      ViewLocationsShowPage.goTo(locationAsWing.prisonId, locationAsWing.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.changeLocalNameLink().click()
      const changeLocalNamePage = Page.verifyOnPage(ChangeLocalNamePage)
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', { parentLocation: updatedLocationAsWing })
      cy.task('stubLocations', updatedLocationAsWing)
      changeLocalNamePage.localNameTextInput().clear()
      changeLocalNamePage.localNameTextInput().click().type('changed local name')
      changeLocalNamePage.saveLocalNameButton().click()

      cy.get('.govuk-error-summary__title').contains('There is a problem')
      cy.get('.govuk-error-message').contains('A location with this name already exists')
    })

    it('shows the success banner when the change is complete', () => {
      ViewLocationsShowPage.goTo(locationAsWing.prisonId, locationAsWing.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      cy.get('.govuk-heading-l').contains('Local Name')
      viewLocationsShowPage.changeLocalNameLink().click()
      cy.task('stubLocationsCheckLocalNameDoesntExist', { prisonId: 'TST', localName: 'new local name' })
      cy.task('stubUpdateLocalName', {
        localName: 'new local name',
        updatedBy: 'TEST_USER',
      })
      const changeLocalNamePage = Page.verifyOnPage(ChangeLocalNamePage)
      changeLocalNamePage.localNameTextInput().clear()
      changeLocalNamePage.localNameTextInput().click().type('new local name')
      changeLocalNamePage.saveLocalNameButton().click()

      Page.verifyOnPage(ViewLocationsShowPage)

      cy.get('#govuk-notification-banner-title').contains('Success')
      cy.get('.govuk-notification-banner__content h3').contains('Local name changed')
      cy.get('.govuk-notification-banner__content p').contains('You have changed the local name.')
    })
  })
})
