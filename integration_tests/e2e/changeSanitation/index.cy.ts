import LocationFactory from '../../../server/testutils/factories/location'
import Page from '../../pages/page'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import ChangeSanitationPage from '../../pages/changeSanitation/details'

context('Change sanitation', () => {
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
    pathHierarchy: 'A-1-001',
    parentId: draftLanding.id,
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
        parentLocation: draftLanding,
      })
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
        parentLocation: draftCell,
      })
      cy.task('stubLocations', draftWing)
      cy.task('stubLocations', draftLanding)
      cy.task('stubLocations', draftCell)
      cy.task('stubGetPrisonConfiguration', { prisonId: 'TST', certificationActive: 'ACTIVE' })
      cy.signIn()
    })

    it('does not show the change sanitation link on the show draft location page', () => {
      ViewLocationsShowPage.goTo(draftCell.prisonId, draftCell.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.changeSanitationLink().should('not.exist')
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
        parentLocation: draftLanding,
      })
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
        parentLocation: draftCell,
      })
      cy.task('stubLocations', draftWing)
      cy.task('stubLocations', draftLanding)
      cy.task('stubLocations', draftCell)
      cy.task('stubGetPrisonConfiguration', { prisonId: 'TST', certificationActive: 'ACTIVE' })
      cy.signIn()
    })

    context('Change sanitation', () => {
      beforeEach(() => {
        ViewLocationsShowPage.goTo(draftCell.prisonId, draftCell.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.changeSanitationLink().click()
      })

      it('shows the success banner after submitting', () => {
        const page = Page.verifyOnPage(ChangeSanitationPage)

        page.submit({ inCellSanitation: true })

        Page.verifyOnPage(ViewLocationsShowPage)
        Page.checkForSuccessBanner('Sanitation changed', 'You have changed sanitation for A-1-001.')
      })
    })
  })
})
