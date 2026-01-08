import LocationFactory from '../../../server/testutils/factories/location'
import AuthSignInPage from '../../pages/authSignIn'
import Page from '../../pages/page'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import SetCellTypeTypePage from '../../pages/setCellType/type'
import SetCellTypeNormalPage from '../../pages/setCellType/normal'
import SetCellTypeSpecialPage from '../../pages/setCellType/special'

context('Set cell type - normal', () => {
  context('without the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      const location = LocationFactory.build({
        accommodationTypes: ['NORMAL_ACCOMMODATION'],
        capacity: {
          maxCapacity: 2,
          workingCapacity: 1,
        },
        leafLevel: true,
        localName: null,
        specialistCellTypes: ['ACCESSIBLE_CELL', 'CONSTANT_SUPERVISION'],
      })
      cy.task('reset')
      cy.task('stubSignIn', { roles: [] })
      cy.task('stubManageUsers')
      cy.task('stubManageUsersMe')
      cy.task('stubManageUsersMeCaseloads')
      cy.task('stubLocationsConstantsAccommodationType')
      cy.task('stubLocationsConstantsConvertedCellType')
      cy.task('stubLocationsConstantsDeactivatedReason')
      cy.task('stubLocationsConstantsLocationType')
      cy.task('stubLocationsConstantsSpecialistCellType')
      cy.task('stubLocationsConstantsUsedForType')
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', { parentLocation: location })
      cy.task('stubGetPrisonConfiguration', { prisonId: 'TST', certificationActive: 'ACTIVE' })
    })

    it('does not show the remove link on the show location page', () => {
      cy.signIn()
      ViewLocationsShowPage.goTo('TST', '7e570000-0000-0000-0000-000000000001')
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.removeCellTypeLink().should('not.exist')
    })

    it('redirects user to sign in page if accessed directly', () => {
      cy.signIn()
      SetCellTypeTypePage.goTo('7e570000-0000-0000-0000-000000000001')
      Page.verifyOnPage(AuthSignInPage)
    })
  })

  context('with the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
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
      cy.task('stubUpdateSpecialistCellTypes')
      cy.task('stubGetPrisonConfiguration', { prisonId: 'TST', certificationActive: 'ACTIVE' })
    })

    context('when the location does not yet have a specific type', () => {
      beforeEach(() => {
        const location = LocationFactory.build({
          accommodationTypes: ['NORMAL_ACCOMMODATION'],
          leafLevel: true,
          specialistCellTypes: [],
          localName: null,
        })
        cy.task('stubLocationsLocationsResidentialSummaryForLocation', { parentLocation: location })
        cy.task('stubLocations', location)
        cy.signIn()
      })

      it('does not show the set cell type link when the cell is inactive', () => {
        const location = LocationFactory.build({
          accommodationTypes: ['NORMAL_ACCOMMODATION'],
          active: false,
          leafLevel: true,
          specialistCellTypes: [],
          localName: null,
        })
        cy.task('stubLocationsLocationsResidentialSummaryForLocation', { parentLocation: location })
        cy.task('stubLocations', location)
        ViewLocationsShowPage.goTo(location.prisonId, location.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.setCellTypeLink().should('not.exist')
      })

      it('can be accessed by clicking the set cell type link on the show location page', () => {
        ViewLocationsShowPage.goTo('TST', '7e570000-0000-0000-0000-000000000001')
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.setCellTypeLink().click()

        Page.verifyOnPage(SetCellTypeTypePage)
      })

      it('has the correct main heading and a caption showing the cell description', () => {
        SetCellTypeTypePage.goTo('7e570000-0000-0000-0000-000000000001')
        Page.verifyOnPage(SetCellTypeTypePage)

        cy.get('h1').contains('Is it a normal or special cell type?')
        cy.get('.govuk-caption-m').contains('Cell A-1-001')
      })

      it('shows the correct validation error when no type is selected', () => {
        SetCellTypeTypePage.goTo('7e570000-0000-0000-0000-000000000001')
        const page = Page.verifyOnPage(SetCellTypeTypePage)

        page.submit({})

        Page.checkForError('set-cell-type_accommodationType', 'Select if it is a normal or special cell type')
      })

      context('normal type', () => {
        it('shows the correct validation error when no normal type is selected', () => {
          SetCellTypeTypePage.goTo('7e570000-0000-0000-0000-000000000001')
          const typePage = Page.verifyOnPage(SetCellTypeTypePage)

          typePage.submit({ normal: true })
          const normalPage = Page.verifyOnPage(SetCellTypeNormalPage)

          normalPage.submit({ types: [] })

          Page.checkForError('set-cell-type_normalCellTypes', 'Select a cell type')
        })

        it('shows the success banner when the change is complete', () => {
          SetCellTypeTypePage.goTo('7e570000-0000-0000-0000-000000000001')
          const typePage = Page.verifyOnPage(SetCellTypeTypePage)

          typePage.submit({ normal: true })
          const normalPage = Page.verifyOnPage(SetCellTypeNormalPage)

          normalPage.submit({ types: ['NORMAL_ACCOMMODATION'] })

          Page.verifyOnPage(ViewLocationsShowPage)
          Page.checkForSuccessBanner('Cell type set', 'You have set a cell type for A-1-001.')
        })
      })

      context('special type', () => {
        it('shows the correct validation error when no special type is selected', () => {
          SetCellTypeTypePage.goTo('7e570000-0000-0000-0000-000000000001')
          const typePage = Page.verifyOnPage(SetCellTypeTypePage)

          typePage.submit({ special: true })
          const specialPage = Page.verifyOnPage(SetCellTypeSpecialPage)

          specialPage.submit({ type: '' })

          Page.checkForError('set-cell-type_specialistCellTypes', 'Select a cell type')
        })

        it('shows the success banner when the change is complete', () => {
          SetCellTypeTypePage.goTo('7e570000-0000-0000-0000-000000000001')
          const typePage = Page.verifyOnPage(SetCellTypeTypePage)

          typePage.submit({ special: true })
          const specialPage = Page.verifyOnPage(SetCellTypeSpecialPage)

          specialPage.submit({ type: 'BIOHAZARD_DIRTY_PROTEST' })

          Page.verifyOnPage(ViewLocationsShowPage)
          Page.checkForSuccessBanner('Cell type set', 'You have set a cell type for A-1-001.')
        })
      })
    })

    context('when the location already has a type', () => {
      beforeEach(() => {
        const location = LocationFactory.build({
          accommodationTypes: ['NORMAL_ACCOMMODATION'],
          leafLevel: true,
          specialistCellTypes: ['BIOHAZARD_DIRTY_PROTEST'],
          localName: null,
        })
        cy.task('stubLocationsLocationsResidentialSummaryForLocation', { parentLocation: location })
        cy.task('stubLocations', location)
        cy.signIn()
      })

      it('does not have the set link on the show location page', () => {
        ViewLocationsShowPage.goTo('TST', '7e570000-0000-0000-0000-000000000001')
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.setCellTypeLink().should('not.exist')
      })

      it('has the remove link on the show location page', () => {
        ViewLocationsShowPage.goTo('TST', '7e570000-0000-0000-0000-000000000001')
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.removeCellTypeLink().should('exist')
      })

      it('does not have the remove link when the cell is inactive', () => {
        const location = LocationFactory.build({
          accommodationTypes: ['NORMAL_ACCOMMODATION'],
          active: false,
          leafLevel: true,
          localName: null,
          specialistCellTypes: ['BIOHAZARD_DIRTY_PROTEST'],
        })
        cy.task('stubLocationsLocationsResidentialSummaryForLocation', { parentLocation: location })
        cy.task('stubLocations', location)
        ViewLocationsShowPage.goTo(location.prisonId, location.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.removeCellTypeLink().should('not.exist')
      })
    })
  })
})
