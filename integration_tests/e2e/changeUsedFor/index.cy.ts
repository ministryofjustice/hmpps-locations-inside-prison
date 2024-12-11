import LocationFactory from '../../../server/testutils/factories/location'
import Page from '../../pages/page'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import ChangeUsedForPage from '../../pages/changeUsedFor/details'

context('Set cell type', () => {
  const locationAsWing = LocationFactory.build({
    accommodationTypes: ['NORMAL_ACCOMMODATION'],
    capacity: { maxCapacity: 2, workingCapacity: 1 },
    leafLevel: false,
    locationType: 'WING',
    localName: '1-1-001',
    specialistCellTypes: ['ACCESSIBLE_CELL', 'CONSTANT_SUPERVISION'],
    usedFor: ['STANDARD_ACCOMMODATION', 'TEST_TYPE'],
  })

  const locationAsCell = LocationFactory.build({
    accommodationTypes: ['NORMAL_ACCOMMODATION'],
    capacity: { maxCapacity: 2, workingCapacity: 1 },
    leafLevel: true,
    localName: '1-1-001',
    specialistCellTypes: ['ACCESSIBLE_CELL', 'CONSTANT_SUPERVISION'],
    usedFor: ['STANDARD_ACCOMMODATION', 'TEST_TYPE'],
  })

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
  }

  context('without the MANAGE_RESIDENTIAL_LOCATIONS role', () => {
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

  context('with the MANAGE_RESIDENTIAL_LOCATIONS role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RESIDENTIAL_LOCATIONS'])
      cy.signIn()
    })

    const itBehavesLikeChangeUsedForPage = () => {
      it('shows the change used for link on all levels and can be accessed', () => {
        ViewLocationsShowPage.goTo(locationAsWing.prisonId, locationAsWing.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.changeCellUsedForLink().click()
        Page.verifyOnPage(ChangeUsedForPage)
      })

      it('has a back link to the show location page', () => {
        ChangeUsedForPage.goTo(locationAsWing.id)
        const changeUsedForPage = Page.verifyOnPage(ChangeUsedForPage)
        changeUsedForPage.backLink().click()
        Page.verifyOnPage(ViewLocationsShowPage)
      })

      it('displays a warning on parent levels about applying change', () => {
        ChangeUsedForPage.goTo(locationAsWing.id)
        const changeUsedForPage = Page.verifyOnPage(ChangeUsedForPage)
        changeUsedForPage
          .usedForWarningText()
          .should(
            'contain.text',
            `This change will apply to all normal accommodation locations in ${locationAsWing.localName}.`,
          )
      })

      it('does not display a warning on a cell level about applying change', () => {
        cy.task('stubLocations', locationAsCell)
        ChangeUsedForPage.goTo(locationAsCell.id)
        const changeUsedForPage = Page.verifyOnPage(ChangeUsedForPage)
        changeUsedForPage.usedForWarningText().should('not.exist')
      })

      it('does show an unchecked checkbox list on a parent level when multiple are checked', () => {
        ViewLocationsShowPage.goTo(locationAsWing.prisonId, locationAsWing.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.changeCellUsedForLink().click()
        ChangeUsedForPage.goTo(locationAsWing.id)
        const changeUsedForPage = Page.verifyOnPage(ChangeUsedForPage)

        const expectedLabels = [
          'Close Supervision Centre (CSC)',
          'Drug recovery / Incentivised substance free living (ISFL)',
          'First night centre / Induction',
          'Test type',
          'Standard accommodation',
        ]
        expectedLabels.forEach((label, index) => {
          changeUsedForPage.cellTypeCheckboxLabels().eq(index).contains(label)
          changeUsedForPage.cellTypeCheckboxLabels().eq(index).prev('input[type="checkbox"]').should('not.be.checked')
        })
      })

      it('does show a checked checkbox list on a cell level when multiple are checked', () => {
        cy.task('stubLocations', locationAsCell)
        ViewLocationsShowPage.goTo(locationAsWing.prisonId, locationAsCell.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.changeCellUsedForLink().click()
        ChangeUsedForPage.goTo(locationAsWing.id)
        const changeUsedForPage = Page.verifyOnPage(ChangeUsedForPage)

        const expectedLabels = [
          'Close Supervision Centre (CSC)',
          'Drug recovery / Incentivised substance free living (ISFL)',
          'First night centre / Induction',
          'Test type',
          'Standard accommodation',
        ]
        expectedLabels.forEach((label, index) => {
          changeUsedForPage.cellTypeCheckboxLabels().eq(index).contains(label)
        })
        changeUsedForPage.cellTypeCheckboxLabels().eq(3).prev('input[type="checkbox"]').should('be.checked')
        changeUsedForPage.cellTypeCheckboxLabels().eq(4).prev('input[type="checkbox"]').should('be.checked')
      })

      it('shows the correct checked checkbox list when one option is checked', () => {
        const updatedLocation = LocationFactory.build({ usedFor: ['TEST_TYPE'] })
        cy.task('stubLocations', updatedLocation)

        ViewLocationsShowPage.goTo(locationAsWing.prisonId, locationAsWing.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.changeCellUsedForLink().click()

        ChangeUsedForPage.goTo(locationAsWing.id)
        const changeUsedForPage = Page.verifyOnPage(ChangeUsedForPage)

        changeUsedForPage.cellTypeCheckboxLabels().eq(3).contains('Test type')
        changeUsedForPage.cellTypeCheckboxLabels().eq(3).prev('input[type="checkbox"]').should('be.checked')
      })

      it('shows success banner when the change is complete', () => {
        cy.task('stubUpdateLocationsConstantsUsedForType')
        ChangeUsedForPage.goTo(locationAsWing.id)
        const changeUsedForPage = Page.verifyOnPage(ChangeUsedForPage)

        changeUsedForPage.cellTypeCheckboxLabels().eq(2).click()
        changeUsedForPage.SaveButton().click()

        Page.verifyOnPage(ViewLocationsShowPage)
        cy.get('#govuk-notification-banner-title').contains('Success')
        cy.get('.govuk-notification-banner__content h3').contains('Used for changed')
        cy.get('.govuk-notification-banner__content p').contains(
          `You have changed what ${locationAsWing.localName} is used for.`,
        )
      })

      it('has a cancel link', () => {
        ChangeUsedForPage.goTo(locationAsWing.id)
        const changeUsedForPage = Page.verifyOnPage(ChangeUsedForPage)
        changeUsedForPage.cancelLink().click()
        Page.verifyOnPage(ViewLocationsShowPage)
      })

      it('shows the correct validation error when nothing is selected', () => {
        ChangeUsedForPage.goTo(locationAsWing.id)
        const changeUsedForPage = Page.verifyOnPage(ChangeUsedForPage)
        changeUsedForPage.SaveButton().click()

        cy.get('.govuk-error-summary__title').contains('There is a problem')
        cy.get('.govuk-error-summary__list').contains('Select what the location is used for')
        cy.get('#usedFor-error').contains('Select what the location is used for')
      })
    }

    itBehavesLikeChangeUsedForPage()
  })
})
