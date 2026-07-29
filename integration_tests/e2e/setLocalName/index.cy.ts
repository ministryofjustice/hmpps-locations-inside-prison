import LocationFactory from '../../../server/testutils/factories/location'
import Page from '../../pages/page'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import SetLocalNamePage from '../../pages/setLocalName'
import LocationsApiStubber from '../../mockApis/locationsApi'
import ManageUsersApiStubber from '../../mockApis/manageUsersApi'
import AuthStubber from '../../mockApis/auth'

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

  const setupStubs = (roles = []) => {
    cy.task('reset')
    AuthStubber.stub.stubSignIn({ roles })
    ManageUsersApiStubber.stub.stubManageUsers()
    ManageUsersApiStubber.stub.stubManageUsersMe()
    ManageUsersApiStubber.stub.stubManageUsersMeCaseloads()
    ManageUsersApiStubber.stub.stubManageCaseloads()
    LocationsApiStubber.stub.stubLocationsConstantsAccommodationType()
    LocationsApiStubber.stub.stubLocationsConstantsConvertedCellType()
    LocationsApiStubber.stub.stubLocationsConstantsDeactivatedReason()
    LocationsApiStubber.stub.stubLocationsConstantsLocationType()
    LocationsApiStubber.stub.stubLocationsConstantsApprovalType()
    LocationsApiStubber.stub.stubLocationsConstantsSpecialistCellType()
    LocationsApiStubber.stub.stubLocationsConstantsUsedForType()
    LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: locationAsWing })
    LocationsApiStubber.stub.stubLocations(locationAsWing)
    LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'ACTIVE' })
  }

  context('Without MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => setupStubs())

    it('does not show change/set links on the show location page', () => {
      cy.signIn()
      ViewLocationsShowPage.goTo(locationAsWing.prisonId, locationAsWing.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.cellUsedForDetails().should('exist')
      viewLocationsShowPage.changeCellUsedForLink().should('not.exist')
    })
  })

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RES_LOCATIONS_OP_CAP'])
      cy.signIn()
    })

    it('shows the add local name link on the show location page', () => {
      ViewLocationsShowPage.goTo(locationAsWing.prisonId, locationAsWing.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.setLocalNameLink().should('exist')
    })

    it('does not show the add local name link on a cell-level page', () => {
      LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: locationAsCell })
      LocationsApiStubber.stub.stubLocations(locationAsCell)
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
      LocationsApiStubber.stub.stubLocationsPrisonLocalName({ exists: false })
      ViewLocationsShowPage.goTo(locationAsWing.prisonId, locationAsWing.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.setLocalNameLink().click()
      Page.verifyOnPage(SetLocalNamePage).saveLocalNameButton().click()

      cy.get('.govuk-error-summary__title').contains('There is a problem')
      cy.get('.govuk-error-summary__list').contains('Enter a local name')
    })

    it('shows validation error when local name exceeds 30 characters', () => {
      LocationsApiStubber.stub.stubLocationsPrisonLocalName({ exists: false })
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
      LocationsApiStubber.stub.stubLocationsPrisonLocalName({ exists: true })
      ViewLocationsShowPage.goTo(locationAsWing.prisonId, locationAsWing.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.setLocalNameLink().click()
      Page.verifyOnPage(SetLocalNamePage).localNameTextInput().click().type('new local name')
      Page.verifyOnPage(SetLocalNamePage).saveLocalNameButton().click()

      cy.get('.govuk-error-summary__title').contains('There is a problem')
      cy.get('.govuk-error-message').contains('A location with this name already exists')
    })

    it('shows success banner when setting a local name is complete', () => {
      LocationsApiStubber.stub.stubLocationsPrisonLocalName({ exists: false })
      LocationsApiStubber.stub.stubUpdateLocalName()
      ViewLocationsShowPage.goTo(locationAsWing.prisonId, locationAsWing.id)
      LocationsApiStubber.stub.stubLocations(updatedLocationAsWing)
      LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({
        parentLocation: updatedLocationAsWing,
      })

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
