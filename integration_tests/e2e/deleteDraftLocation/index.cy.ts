import LocationFactory from '../../../server/testutils/factories/location'
import Page from '../../pages/page'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import DeleteDraftConfirmPage from '../../pages/deleteDraftLocation/confirm'
import ViewLocationsIndexPage from '../../pages/viewLocations'

context('Delete draft location', () => {
  const draftWing = LocationFactory.build({
    id: '7e570000-0000-1000-8000-000000000003',
    pathHierarchy: 'B',
    parentId: null,
    locationType: 'WING',
    status: 'DRAFT',
    active: false,
    localName: 'draftW',
  })

  const activeWing = LocationFactory.build({
    id: 'ACTIVE000-0000-1000-8000-000000000003',
    pathHierarchy: 'B',
    parentId: null,
    locationType: 'WING',
    status: 'ACTIVE',
    active: true,
    localName: 'activeW',
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
    cy.task('setFeatureFlag', { createAndCertify: true })
  })

  context('Without the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      cy.task('stubSignIn')
      cy.task('stubManageUsers')
      cy.task('stubManageUsersMe')
      cy.task('stubManageUsersMeCaseloads')
      cy.task('stubLocationsConstantsAccommodationType')
      cy.task('stubLocationsConstantsConvertedCellType')
      cy.task('stubLocationsConstantsDeactivatedReason')
      cy.task('stubLocationsConstantsLocationType')
      cy.task('stubLocationsConstantsSpecialistCellType')
      cy.task('stubLocationsConstantsUsedForType')
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
        parentLocation: draftWing,
      })
      cy.task('stubLocations', draftWing)
      cy.task('stubGetPrisonConfiguration', { prisonId: 'TST', certificationActive: 'INACTIVE' })
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
      cy.task('stubSignIn', { roles: ['MANAGE_RES_LOCATIONS_OP_CAP'] })
      cy.task('stubManageUsers')
      cy.task('stubManageUsersMe')
      cy.task('stubManageUsersMeCaseloads')
      cy.task('stubLocationsConstantsAccommodationType')
      cy.task('stubLocationsConstantsConvertedCellType')
      cy.task('stubLocationsConstantsDeactivatedReason')
      cy.task('stubLocationsConstantsLocationType')
      cy.task('stubLocationsConstantsSpecialistCellType')
      cy.task('stubLocationsConstantsUsedForType')
      cy.task('stubLocationsDeleteLocation')
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
        parentLocation: draftWing,
      })
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
        parentLocation: activeWing,
      })
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
        parentLocation: draftCell,
      })
      cy.task('stubLocations', activeWing)
      cy.task('stubLocations', draftWing)
      cy.task('stubLocations', draftCell)
      cy.task('stubGetPrisonConfiguration', { prisonId: 'TST', certificationActive: 'ACTIVE' })
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
        DeleteDraftConfirmPage.goTo(draftWing.id)
        const deleteDraftConfirmPage = new DeleteDraftConfirmPage('wing')
        deleteDraftConfirmPage.confirmButton('wing').click()

        cy.task('stubLocationsLocationsResidentialSummary')
        ViewLocationsShowPage.goTo(draftWing.prisonId)
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
        DeleteDraftConfirmPage.goTo(draftCell.id)
        const deleteDraftConfirmPage = new DeleteDraftConfirmPage('cell')
        deleteDraftConfirmPage.confirmButton('cell').click()
        cy.get('#govuk-notification-banner-title').contains('Success')
        cy.get('.govuk-notification-banner__content h3').contains('Cell deleted')
        cy.get('.govuk-notification-banner__content p').contains('You have deleted draftCell')
      })
    })
  })
})
