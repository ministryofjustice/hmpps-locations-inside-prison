import LocationFactory from '../../../server/testutils/factories/location'
import Page from '../../pages/page'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import ChangeUsedForPage from '../../pages/changeUsedFor/details'

context('Set cell type', () => {
  const location = LocationFactory.build({
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
    cy.task('stubLocationsLocationsResidentialSummaryForLocation', { parentLocation: location })
    cy.task('stubLocations', location)
  }

  context('without the MANAGE_RESIDENTIAL_LOCATIONS role', () => {
    beforeEach(() => {
      setupStubs(['VIEW_INTERNAL_LOCATION'])
    })

    it('does not show the change/set links on the show location page', () => {
      cy.signIn()
      ViewLocationsShowPage.goTo(location.prisonId, location.id)
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
      it('can be accessed by clicking the change link on the show location page', () => {
        ViewLocationsShowPage.goTo(location.prisonId, location.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.changeCellUsedForLink().click()
        Page.verifyOnPage(ChangeUsedForPage)
      })

      it('has a back link to the show location page', () => {
        ChangeUsedForPage.goTo(location.id)
        const changeUsedForPage = Page.verifyOnPage(ChangeUsedForPage)
        changeUsedForPage.backLink().click()
        Page.verifyOnPage(ViewLocationsShowPage)
      })

      it('displays a warning about applying change', () => {
        ChangeUsedForPage.goTo(location.id)
        const changeUsedForPage = Page.verifyOnPage(ChangeUsedForPage)
        changeUsedForPage
          .usedForWarningText()
          .should(
            'contain.text',
            `This change will apply to all normal accommodation locations in ${location.localName}.`,
          )
      })

      it('shows the correct unchecked checkbox list', () => {
        ViewLocationsShowPage.goTo(location.prisonId, location.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.changeCellUsedForLink().click()
        ChangeUsedForPage.goTo(location.id)
        const changeUsedForPage = Page.verifyOnPage(ChangeUsedForPage)

        const expectedLabels = ['Test type', 'Standard accommodation', 'Changed type']
        expectedLabels.forEach((label, index) => {
          changeUsedForPage.cellTypeCheckboxLabels().eq(index).contains(label)
          changeUsedForPage.cellTypeCheckboxLabels().eq(index).prev('input[type="checkbox"]').should('not.be.checked')
        })
      })

      it('shows the correct checked checkbox list', () => {
        const updatedLocation = LocationFactory.build({ usedFor: ['TEST_TYPE'] })
        cy.task('stubLocations', updatedLocation)

        ViewLocationsShowPage.goTo(location.prisonId, location.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.changeCellUsedForLink().click()

        ChangeUsedForPage.goTo(location.id)
        const changeUsedForPage = Page.verifyOnPage(ChangeUsedForPage)

        changeUsedForPage.cellTypeCheckboxLabels().eq(0).contains('Test type')
        changeUsedForPage.cellTypeCheckboxLabels().eq(0).prev('input[type="checkbox"]').should('be.checked')
      })

      it('shows success banner when the change is complete', () => {
        cy.task('stubUpdateLocationsConstantsUsedForType')
        ChangeUsedForPage.goTo(location.id)
        const changeUsedForPage = Page.verifyOnPage(ChangeUsedForPage)

        changeUsedForPage.cellTypeCheckboxLabels().eq(2).click()
        changeUsedForPage.SaveButton().click()

        Page.verifyOnPage(ViewLocationsShowPage)
        cy.get('#govuk-notification-banner-title').contains('Success')
        cy.get('.govuk-notification-banner__content h3').contains('Used for changed')
        cy.get('.govuk-notification-banner__content p').contains(
          `You have changed what ${location.localName} is used for.`,
        )
      })

      it('has a cancel link', () => {
        ChangeUsedForPage.goTo(location.id)
        const changeUsedForPage = Page.verifyOnPage(ChangeUsedForPage)
        changeUsedForPage.cancelLink().click()
        Page.verifyOnPage(ViewLocationsShowPage)
      })

      it('shows the correct validation error when nothing is selected', () => {
        ChangeUsedForPage.goTo(location.id)
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
