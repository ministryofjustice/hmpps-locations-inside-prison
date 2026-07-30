import LocationFactory from '../../../server/testutils/factories/location'
import Page from '../../pages/page'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import DeleteDraftConfirmPage from '../../pages/deleteDraftLocation/confirm'
import ViewLocationsIndexPage from '../../pages/viewLocations'
import ManageUsersApiStubber from '../../mockApis/manageUsersApi'
import AuthStubber from '../../mockApis/auth'
import LocationsApiStubber from '../../mockApis/locationsApi'

context('Delete draft location', () => {
  const draftWing = LocationFactory.build({
    id: '7e570000-0000-1000-8000-000000000003',
    pathHierarchy: 'B',
    parentId: null,
    locationType: 'WING',
    status: 'DRAFT',
    active: false,
    localName: 'draftW',
    level: 1,
    leafLevel: false,
  })

  const activeWing = LocationFactory.build({
    id: 'ACTIVE000-0000-1000-8000-000000000003',
    pathHierarchy: 'B',
    parentId: null,
    locationType: 'WING',
    status: 'ACTIVE',
    active: true,
    localName: 'activeW',
    level: 1,
    leafLevel: false,
  })

  const draftCell = LocationFactory.build({
    id: '7e570000-0000-1000-8000-000000000004',
    pathHierarchy: 'B-draftCell',
    parentId: '7e570000-0000-1000-8000-000000000003',
    locationType: 'CELL',
    status: 'DRAFT',
    active: false,
    localName: 'draftCell',
  })

  beforeEach(() => {
    cy.task('reset')
  })

  context('Without the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      AuthStubber.stub.stubSignIn()
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
      LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({
        parentLocation: draftWing,
      })
      LocationsApiStubber.stub.stubLocations(draftWing)
      LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'ACTIVE' })
      cy.signIn()
    })

    it('does not show the delete button on the show draft location page', () => {
      ViewLocationsShowPage.goTo(draftWing.prisonId, draftWing.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.deleteButton().should('not.exist')
    })
  })

  context('With the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      AuthStubber.stub.stubSignIn({ roles: ['MANAGE_RES_LOCATIONS_OP_CAP'] })
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
      LocationsApiStubber.stub.stubLocationsDeleteLocation()
      LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({
        parentLocation: draftWing,
      })
      LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({
        parentLocation: activeWing,
      })
      LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({
        parentLocation: draftCell,
      })
      LocationsApiStubber.stub.stubLocations(activeWing)
      LocationsApiStubber.stub.stubLocations(draftWing)
      LocationsApiStubber.stub.stubLocations(draftCell)
      LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'ACTIVE' })
      cy.signIn()
    })

    context('Delete draft WING', () => {
      it('does not show the delete button on the show ACTIVE location page', () => {
        ViewLocationsShowPage.goTo(activeWing.prisonId, activeWing.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.statusTag().should('not.contain.text', 'Draft')
        viewLocationsShowPage.deactivateButton().should('exist')
        viewLocationsShowPage.deleteButton().should('not.exist')
      })

      it('shows the delete button on the show DRAFT location page', () => {
        ViewLocationsShowPage.goTo(draftWing.prisonId, draftWing.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.statusTag().should('contain.text', 'Draft')
        viewLocationsShowPage.deleteButton().should('exist')
      })

      it('shows the success banner after deleting a DRAFT wing ', () => {
        ViewLocationsShowPage.goTo(draftWing.prisonId, draftWing.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.deleteButton().click()
        const deleteDraftConfirmPage = new DeleteDraftConfirmPage('wing')
        LocationsApiStubber.stub.stubLocationsLocationsResidentialSummary()
        deleteDraftConfirmPage.confirmButton('wing').click()

        Page.verifyOnPage(ViewLocationsIndexPage)
        cy.get('#govuk-notification-banner-title').contains('Success')
        cy.get('.govuk-notification-banner__content h3').contains('Wing deleted')
        cy.get('.govuk-notification-banner__content p').contains('You have deleted draftW')
      })
    })

    context('Delete draft CELL', () => {
      it('shows the success banner after deleting a DRAFT cell ', () => {
        ViewLocationsShowPage.goTo(draftCell.prisonId, draftCell.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.deleteButton().click()
        const deleteDraftConfirmPage = new DeleteDraftConfirmPage('cell')
        deleteDraftConfirmPage.confirmButton('cell').click()
        cy.get('#govuk-notification-banner-title').contains('Success')
        cy.get('.govuk-notification-banner__content h3').contains('Cell deleted')
        cy.get('.govuk-notification-banner__content p').contains('You have deleted draftCell')
      })
    })
  })
})
