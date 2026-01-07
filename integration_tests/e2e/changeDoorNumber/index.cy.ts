import LocationFactory from '../../../server/testutils/factories/location'
import Page from '../../pages/page'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import ChangeDoorNumberPage from '../../pages/changeDoorNumber/details'

context('Change door number', () => {
  const draftWing = LocationFactory.build({
    level: 1,
    leafLevel: false,
    id: '7e570000-0000-1000-8000-000000000003',
    pathHierarchy: 'WINGA',
    parentId: null,
    locationType: 'WING',
    status: 'DRAFT',
    active: false,
    localName: 'draftW',
    code: 'WINGA',
    certification: {
      certified: false,
      capacityOfCertifiedCell: 0,
    },
  })

  const draftLanding = LocationFactory.build({
    level: 2,
    leafLevel: false,
    id: '7e570000-0000-1000-8000-000000000004',
    pathHierarchy: 'WINGA-LANDA',
    parentId: draftWing.id,
    locationType: 'LANDING',
    status: 'DRAFT',
    active: false,
    localName: 'draftL',
    code: 'LANDA',
    certification: {
      certified: false,
      capacityOfCertifiedCell: 0,
    },
  })

  const draftCell = LocationFactory.build({
    level: 3,
    leafLevel: true,
    id: '7e570000-0000-1000-8000-000000000005',
    pathHierarchy: 'WINGA-LANDA-001',
    parentId: draftWing.id,
    locationType: 'CELL',
    status: 'DRAFT',
    active: false,
    localName: null,
    code: '001',
    cellMark: 'A1-01',
    certification: {
      certified: false,
      capacityOfCertifiedCell: 0,
    },
  })

  context('Without the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      cy.task('reset')
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
      cy.task('stubLocationsLocationsResidentialSummary')
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
        parentLocation: draftWing,
      })
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
        parentLocation: draftCell,
      })
      cy.task('stubLocations', draftWing)
      cy.task('stubLocations', draftCell)
      cy.task('stubGetPrisonConfiguration', { prisonId: 'TST', certificationActive: 'ACTIVE' })
      cy.signIn()
    })

    it('does not show the change door number link on the show draft location page', () => {
      ViewLocationsShowPage.goTo(draftWing.prisonId, draftCell.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.changeDoorNumberLink().should('not.exist')
    })
  })

  context('With the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      cy.task('reset')
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
      cy.task('stubPatchLocation')
      cy.task('stubLocationsLocationsResidentialSummary')
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
        parentLocation: draftWing,
      })
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
        parentLocation: draftCell,
      })
      cy.task('stubLocations', draftWing)
      cy.task('stubLocations', draftCell)
      cy.task('stubGetPrisonConfiguration', { prisonId: 'TST', certificationActive: 'ACTIVE' })
      cy.signIn()
    })

    context('Change door number', () => {
      beforeEach(() => {
        ViewLocationsShowPage.goTo(draftLanding.prisonId, draftCell.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.changeDoorNumberLink().click()
      })

      it('shows the input prefix when changing the location code of a DRAFT landing', () => {
        const page = Page.verifyOnPage(ChangeDoorNumberPage)

        page.submit({ doorNumber: 'L-01' })

        Page.verifyOnPage(ViewLocationsShowPage)

        cy.get('#govuk-notification-banner-title').contains('Success')
        cy.get('.govuk-notification-banner__content h3').contains('Cell door number changed')
        cy.get('.govuk-notification-banner__content p').contains(
          'You have changed the door number for cell WINGA-LANDA-001.',
        )
      })
    })
  })
})
