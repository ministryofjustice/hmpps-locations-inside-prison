import LocationFactory from '../../../server/testutils/factories/location'
import AuthSignInPage from '../../pages/authSignIn'
import Page from '../../pages/page'
import SetCellTypePage from '../../pages/setCellType'
import ViewLocationsShowPage from '../../pages/viewLocations/show'

context('Set cell type', () => {
  context('without the MANAGE_RESIDENTIAL_LOCATIONS role', () => {
    beforeEach(() => {
      const location = LocationFactory.build({
        accommodationTypes: ['NORMAL_ACCOMMODATION'],
        capacity: {
          maxCapacity: 2,
          workingCapacity: 1,
        },
        leafLevel: true,
        localName: '1-1-001',
        specialistCellTypes: ['ACCESSIBLE_CELL', 'CONSTANT_SUPERVISION'],
      })
      cy.task('reset')
      cy.task('stubSignIn', { roles: ['VIEW_INTERNAL_LOCATION'] })
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
    })

    it('does not show the change/set links on the show location page', () => {
      cy.signIn()
      cy.visit('/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000001')
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.setSpecificCellTypeLink().should('not.exist')
      viewLocationsShowPage.changeSpecificCellTypeLink().should('not.exist')
    })

    it('redirects user to sign in page if accessed directly', () => {
      cy.signIn()
      SetCellTypePage.goTo('7e570000-0000-0000-0000-000000000001')
      Page.verifyOnPage(AuthSignInPage)
    })
  })

  context('with the MANAGE_RESIDENTIAL_LOCATIONS role', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', { roles: ['MANAGE_RESIDENTIAL_LOCATIONS'] })
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
    })

    function itBehavesLikeSetCellTypePage() {
      it('has a back link to the show location page', () => {
        SetCellTypePage.goTo('7e570000-0000-0000-0000-000000000000')
        const setCellTypePage = Page.verifyOnPage(SetCellTypePage)
        setCellTypePage.backLink().click()

        Page.verifyOnPage(ViewLocationsShowPage)
      })

      it('has the expected hint text', () => {
        SetCellTypePage.goTo('7e570000-0000-0000-0000-000000000000')
        Page.verifyOnPage(SetCellTypePage)

        cy.get('#specialistCellTypes-hint').contains('Select all that apply.')
      })

      it('shows the correct checkbox list', () => {
        SetCellTypePage.goTo('7e570000-0000-0000-0000-000000000000')
        const setCellTypePage = Page.verifyOnPage(SetCellTypePage)

        setCellTypePage.cellTypeCheckboxLabels().eq(0).contains('Accessible cell')
        setCellTypePage
          .cellTypeCheckboxHints()
          .eq(0)
          .contains('Also known as wheelchair accessible or Disability and Discrimination Act (DDA) compliant')
        setCellTypePage.cellTypeCheckboxLabels().eq(1).contains('Biohazard / dirty protest cell')
        setCellTypePage.cellTypeCheckboxHints().eq(1).contains('Previously known as a dirty protest cell')
        setCellTypePage.cellTypeCheckboxLabels().eq(2).contains('Constant Supervision Cell')
      })

      it('has an inset text warning about working capacity', () => {
        SetCellTypePage.goTo('7e570000-0000-0000-0000-000000000000')

        cy.get('.govuk-inset-text p').contains(
          'Set the working capacity to 0 for special accommodation cells as they should only be used for temporary housing:',
        )
        cy.get('.govuk-inset-text li').eq(0).contains('Biohazard cells')
        cy.get('.govuk-inset-text li').eq(1).contains('Care and separation cells')
        cy.get('.govuk-inset-text li').eq(2).contains('Dry cells')
        cy.get('.govuk-inset-text li').eq(3).contains('Unfurnished cells')
      })

      it('has a cancel link', () => {
        SetCellTypePage.goTo('7e570000-0000-0000-0000-000000000000')
        const setCellTypePage = Page.verifyOnPage(SetCellTypePage)

        setCellTypePage.cancelLink().click()

        Page.verifyOnPage(ViewLocationsShowPage)
      })
    }

    context('when the location does not yet have a specific type', () => {
      beforeEach(() => {
        const location = LocationFactory.build({
          accommodationTypes: ['NORMAL_ACCOMMODATION'],
          leafLevel: true,
          specialistCellTypes: [],
          localName: '1-1-001',
        })
        cy.task('stubLocationsLocationsResidentialSummaryForLocation', { parentLocation: location })
        cy.task('stubGetLocation', location)
        cy.signIn()
      })

      itBehavesLikeSetCellTypePage()

      it('has the correct main heading and a caption showing the cell description', () => {
        SetCellTypePage.goTo('7e570000-0000-0000-0000-000000000000')
        Page.verifyOnPage(SetCellTypePage)

        cy.get('h1').contains('Set specific cell type')
        cy.get('.govuk-caption-m').contains('Cell 1-1-001')
      })

      it('can be accessed by clicking the change link on the show location page', () => {
        cy.visit('/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000000')
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.setSpecificCellTypeLink().click()

        Page.verifyOnPage(SetCellTypePage)
      })

      it('shows the correct validation error when nothing is selected', () => {
        SetCellTypePage.goTo('7e570000-0000-0000-0000-000000000000')
        const setCellTypePage = Page.verifyOnPage(SetCellTypePage)

        setCellTypePage.saveCellTypeButton().click()

        cy.get('.govuk-error-summary__title').contains('There is a problem')
        cy.get('.govuk-error-summary__list').contains('Select a cell type')
        cy.get('#specialistCellTypes-error').contains('Select a cell type')
      })

      it('shows the success banner when the change is complete', () => {
        SetCellTypePage.goTo('7e570000-0000-0000-0000-000000000000')
        const setCellTypePage = Page.verifyOnPage(SetCellTypePage)
        setCellTypePage.cellTypeCheckbox('ACCESSIBLE_CELL').click()
        setCellTypePage.saveCellTypeButton().click()

        Page.verifyOnPage(ViewLocationsShowPage)
        cy.get('#govuk-notification-banner-title').contains('Success')
        cy.get('.govuk-notification-banner__content h3').contains('Cell type set')
        cy.get('.govuk-notification-banner__content p').contains('You have set a specific cell type for this location')
      })
    })

    context('when the location already has a specific type', () => {
      beforeEach(() => {
        const location = LocationFactory.build({
          accommodationTypes: ['NORMAL_ACCOMMODATION'],
          leafLevel: true,
          specialistCellTypes: ['BIOHAZARD_DIRTY_PROTEST'],
          localName: '1-1-001',
        })
        cy.task('stubLocationsLocationsResidentialSummaryForLocation', { parentLocation: location })
        cy.task('stubGetLocation', location)
        cy.signIn()
      })

      itBehavesLikeSetCellTypePage()

      it('has the correct main heading and a caption showing the cell description', () => {
        SetCellTypePage.goTo('7e570000-0000-0000-0000-000000000000')
        Page.verifyOnPage(SetCellTypePage)

        cy.get('h1').contains('Change specific cell type')
        cy.get('.govuk-caption-m').contains('Cell 1-1-001')
      })

      it('can be accessed by clicking the change link on the show location page', () => {
        cy.visit('/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000000')
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.changeSpecificCellTypeLink().click()

        Page.verifyOnPage(SetCellTypePage)
      })

      it('shows the correct validation error when nothing is selected', () => {
        SetCellTypePage.goTo('7e570000-0000-0000-0000-000000000000')
        const setCellTypePage = Page.verifyOnPage(SetCellTypePage)

        setCellTypePage.cellTypeCheckbox('BIOHAZARD_DIRTY_PROTEST').click()
        setCellTypePage.saveCellTypeButton().click()

        cy.get('.govuk-error-summary__title').contains('There is a problem')
        cy.get('.govuk-error-summary__list').contains('Select a cell type')
        cy.get('#specialistCellTypes-error').contains('Select a cell type')
      })

      it('shows the success banner when the change is complete', () => {
        SetCellTypePage.goTo('7e570000-0000-0000-0000-000000000000')
        const setCellTypePage = Page.verifyOnPage(SetCellTypePage)
        setCellTypePage.cellTypeCheckbox('ACCESSIBLE_CELL').click()
        setCellTypePage.cellTypeCheckbox('BIOHAZARD_DIRTY_PROTEST').click()
        setCellTypePage.saveCellTypeButton().click()

        Page.verifyOnPage(ViewLocationsShowPage)
        cy.get('#govuk-notification-banner-title').contains('Success')
        cy.get('.govuk-notification-banner__content h3').contains('Cell type set')
        cy.get('.govuk-notification-banner__content p').contains('You have set a specific cell type for this location')
      })
    })
  })
})
