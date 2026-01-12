import LocationFactory from '../../../server/testutils/factories/location'
import Page from '../../pages/page'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import ChangeLocationCodePage from '../../pages/changeDraftLocationCode/confirm'
import buildLocationHierarchy from '../../../server/testutils/buildLocationHierarchy'

context('Change draft location code', () => {
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
    leafLevel: true,
    id: '7e570000-0000-1000-8000-000000000004',
    pathHierarchy: 'WINGA',
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
    id: '7e570000-0000-1000-8000-000000000006',
    pathHierarchy: 'WINGB-LANDB-001',
    parentId: draftLanding.id,
    locationType: 'CELL',
    status: 'DRAFT',
    active: false,
    localName: null,
    code: '001',
    certification: {
      certified: false,
      capacityOfCertifiedCell: 0,
    },
  })

  const activeWing = LocationFactory.build({
    level: 1,
    id: 'ACTIVE000-0000-1000-8000-000000000005',
    pathHierarchy: 'B',
    parentId: null,
    locationType: 'WING',
    status: 'ACTIVE',
    active: true,
    localName: 'activeW',
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
      cy.task('stubLocations', draftWing)
      cy.task('stubGetPrisonConfiguration', { prisonId: 'TST', certificationActive: 'ACTIVE' })
      cy.signIn()
    })

    it('does not show the change location code link on the show draft location page', () => {
      ViewLocationsShowPage.goTo(draftWing.prisonId, draftWing.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.changeLocationCodeLink().should('not.exist')
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
      cy.task('stubLocationsLocationsResidentialSummary')
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
        parentLocation: draftWing,
      })
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
        parentLocation: activeWing,
      })
      cy.task('stubLocations', activeWing)
      cy.task('stubLocations', draftWing)
      cy.task('stubGetPrisonConfiguration', { prisonId: 'TST', certificationActive: 'ACTIVE' })
      cy.signIn()
    })

    context('Change draft WING location code', () => {
      beforeEach(() => {
        cy.task('stubPatchLocation', { ...draftWing, pathHierarchy: 'WINGB' })
      })

      context('Validation checks', () => {
        beforeEach(() => {
          ViewLocationsShowPage.goTo(draftWing.prisonId, draftWing.id)
          const page = Page.verifyOnPage(ViewLocationsShowPage)
          page.changeLocationCodeLink().click()
        })

        it('shows the correct validation error for wing location code when submitting non-alphanumeric characters', () => {
          const page = new ChangeLocationCodePage('wing')
          page.submit({
            locationCode: '!@£$',
          })
          Page.checkForError('locationCode', 'Wing code can only include numbers or letters')
        })

        it('shows the correct validation error for wing location code when submitting nothing', () => {
          const page = new ChangeLocationCodePage('wing')
          page.submit({ locationCode: '' })

          Page.checkForError('locationCode', 'Enter a wing code')
        })

        it('shows the correct validation error for wing location code when submitting more than 5 characters', () => {
          const page = new ChangeLocationCodePage('wing')
          page.submit({ locationCode: 'thisistoolong' })

          Page.checkForError('locationCode', 'Wing code must be 5 characters or less')
        })
      })

      it('does not show the change location code link on the show ACTIVE wing page', () => {
        ViewLocationsShowPage.goTo(activeWing.prisonId, activeWing.id)
        const page = Page.verifyOnPage(ViewLocationsShowPage)
        page.statusTag().should('not.contain.text', 'Draft')
        page.changeLocationCodeLink().should('not.exist')
      })

      it('shows the change location code link on the show DRAFT wing page', () => {
        ViewLocationsShowPage.goTo(draftWing.prisonId, draftWing.id)
        const page = Page.verifyOnPage(ViewLocationsShowPage)
        page.statusTag().should('contain.text', 'Draft')
        page.changeLocationCodeLink().should('exist')
      })

      it('shows the correct error if the landing code already exists on a DRAFT wing', () => {
        cy.task('stubLocationsLocationsResidentialSummaryByKey')
        ViewLocationsShowPage.goTo(draftWing.prisonId, draftWing.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.changeLocationCodeLink().click()
        ChangeLocationCodePage.goTo(draftWing.id)

        const page = new ChangeLocationCodePage('wing')
        page.locationCodeInputPrefix().should('not.exist')
        page.submit({ locationCode: '002' })

        Page.checkForError('locationCode', 'A location with this wing code already exists')
      })

      it('shows the success banner after changing the location code of a DRAFT wing ', () => {
        ViewLocationsShowPage.goTo(draftWing.prisonId, draftWing.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.changeLocationCodeLink().click()
        ChangeLocationCodePage.goTo(draftWing.id)

        const page = new ChangeLocationCodePage('wing')
        page.locationCodeInputPrefix().should('not.exist')
        page.submit({ locationCode: 'WINGB' })

        Page.verifyOnPage(ViewLocationsShowPage)
        Page.checkForSuccessBanner('Wing code changed', 'You have changed the wing code for WINGB.')
      })
    })

    context('Change draft LANDING location code', () => {
      beforeEach(() => {
        cy.task('stubPatchLocation', { ...draftLanding, pathHierarchy: 'WINGB-LANDB' })
        cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
          parentLocation: draftLanding,
          locationHierarchy: buildLocationHierarchy([draftWing, draftLanding]),
        })
        cy.task('stubLocations', draftLanding)
        ViewLocationsShowPage.goTo(draftLanding.prisonId, draftLanding.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.changeLocationCodeLink().click()
      })

      it('shows the input prefix when changing the location code of a DRAFT landing', () => {
        const page = new ChangeLocationCodePage('landing')

        page.locationCodeInputPrefix().should('exist')
        page.submit({ locationCode: 'LANDB' })

        Page.verifyOnPage(ViewLocationsShowPage)
        Page.checkForSuccessBanner('Landing code changed', 'You have changed the landing code for WINGB-LANDB.')
      })
    })

    context('Change draft CELL location code', () => {
      beforeEach(() => {
        cy.task('stubPatchLocation', { ...draftCell, pathHierarchy: 'WINGB-LANDB-003' })
        cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
          parentLocation: draftCell,
          locationHierarchy: buildLocationHierarchy([draftWing, draftLanding, draftCell]),
        })
        cy.task('stubLocations', draftLanding)
        cy.task('stubLocations', draftCell)
        ViewLocationsShowPage.goTo(draftCell.prisonId, draftCell.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.changeLocationCodeLink().click()
      })

      it('shows the input prefix when changing the location code of a DRAFT cell', () => {
        const page = new ChangeLocationCodePage('cell')

        page.locationCodeInputPrefix().should('exist')
        page.submit({ locationCode: '3' })

        Page.verifyOnPage(ViewLocationsShowPage)
        Page.checkForSuccessBanner('Cell number changed', 'You have changed the cell number for WINGB-LANDB-003.')
      })
    })
  })
})
