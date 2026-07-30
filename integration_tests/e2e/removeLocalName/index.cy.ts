import LocationFactory from '../../../server/testutils/factories/location'
import Page from '../../pages/page'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import RemoveLocalNamePage from '../../pages/removeLocalName'
import LocationsApiStubber from '../../mockApis/locationsApi'
import ManageUsersApiStubber from '../../mockApis/manageUsersApi'
import AuthStubber from '../../mockApis/auth'

context('Remove Local Name', () => {
  const locationAsWing = LocationFactory.build({
    accommodationTypes: ['NORMAL_ACCOMMODATION'],
    capacity: { maxCapacity: 2, workingCapacity: 1 },
    leafLevel: false,
    locationType: 'WING',
    localName: 'Local Name',
    specialistCellTypes: ['ACCESSIBLE_CELL', 'CONSTANT_SUPERVISION'],
    usedFor: ['STANDARD_ACCOMMODATION', 'TEST_TYPE'],
  })

  const updatedLocationAsWing = { ...locationAsWing, localName: '' }

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

    it('does not show change/remove links on the location page', () => {
      cy.signIn()
      ViewLocationsShowPage.goTo(locationAsWing.prisonId, locationAsWing.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.cellUsedForDetails().should('exist')
      viewLocationsShowPage.removeLocalNameLink().should('not.exist')
    })
  })

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RES_LOCATIONS_OP_CAP'])
      cy.signIn()
    })

    it('shows the remove local name link on the location page', () => {
      ViewLocationsShowPage.goTo(locationAsWing.prisonId, locationAsWing.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.changeLocalNameLink().should('exist')
    })

    it('does not show the remove local name link on a cell-level page', () => {
      LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: locationAsCell })
      LocationsApiStubber.stub.stubLocations(locationAsCell)
      ViewLocationsShowPage.goTo(locationAsCell.prisonId, locationAsCell.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.localNameRow().should('not.exist')
    })

    it('accesses the remove local name page and has correct links', () => {
      ViewLocationsShowPage.goTo(locationAsWing.prisonId, locationAsWing.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.removeLocalNameLink().click()
      Page.verifyOnPage(RemoveLocalNamePage).backLink().click()
      Page.verifyOnPage(ViewLocationsShowPage)
    })

    it('shows a cancel link on the remove local name page', () => {
      ViewLocationsShowPage.goTo(locationAsWing.prisonId, locationAsWing.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.removeLocalNameLink().click()
      Page.verifyOnPage(RemoveLocalNamePage).cancelLink().click()
      Page.verifyOnPage(ViewLocationsShowPage)
    })

    it('displays a success banner after removing the local name', () => {
      LocationsApiStubber.stub.stubLocationsPrisonLocalName({ exists: false })
      LocationsApiStubber.stub.stubUpdateLocalName()
      ViewLocationsShowPage.goTo(locationAsWing.prisonId, locationAsWing.id)
      LocationsApiStubber.stub.stubLocations(updatedLocationAsWing)
      LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({
        parentLocation: updatedLocationAsWing,
      })

      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.removeLocalNameLink().click()
      Page.verifyOnPage(RemoveLocalNamePage).removeLocalNameButton().click()

      Page.verifyOnPage(ViewLocationsShowPage)
      cy.get('#govuk-notification-banner-title').contains('Success')
      cy.get('.govuk-notification-banner__content h3').contains('Local name removed')
      cy.get('.govuk-heading-l').contains('A-1-001')
    })
  })
})
