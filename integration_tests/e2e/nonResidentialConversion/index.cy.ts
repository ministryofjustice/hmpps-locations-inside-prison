import LocationFactory from '../../../server/testutils/factories/location'
import AuthSignInPage from '../../pages/authSignIn'
import NonResidentialConversionConfirmPage from '../../pages/nonResidentialConversion/confirm'
import NonResidentialConversionDetailsPage from '../../pages/nonResidentialConversion/details'
import NonResidentialConversionOccupiedPage from '../../pages/nonResidentialConversion/occupied'
import NonResidentialConversionWarningPage from '../../pages/nonResidentialConversion/warning'
import Page from '../../pages/page'
import ViewLocationsShowPage from '../../pages/viewLocations/show'

context('Non-residential conversion', () => {
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

  context('without the MANAGE_RESIDENTIAL_LOCATIONS role', () => {
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
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', { parentLocation: location })
      cy.task('stubLocations', location)
      cy.task('stubGetPrisonConfiguration', { prisonId: 'TST', certificationActive: 'INACTIVE' })
      cy.signIn()
    })

    it('redirects user to sign in page when accessed directly', () => {
      NonResidentialConversionWarningPage.goTo('7e570000-0000-0000-0000-000000000001')
      Page.verifyOnPage(AuthSignInPage)
    })

    it('does not show the action in the menu on the show location page', () => {
      ViewLocationsShowPage.goTo(location.prisonId, location.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.convertToNonResAction().should('not.exist')
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
      cy.task('stubLocationsLocationsResidentialSummary')
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', { parentLocation: location })
      cy.task('stubLocations', location)
      cy.task('stubPrisonerLocationsId', [])
      cy.task('stubLocationsConvertCellToNonResCell')
      cy.task('stubGetPrisonConfiguration', { prisonId: 'TST', certificationActive: 'INACTIVE' })
      cy.signIn()
    })

    function itDisplaysTheCellOccupiedPage() {
      it('has a caption showing the cell description', () => {
        Page.verifyOnPage(NonResidentialConversionOccupiedPage)
        cy.get('.govuk-caption-m').contains('1-1-001')
      })

      it('shows the correct error message', () => {
        Page.verifyOnPage(NonResidentialConversionOccupiedPage)
        cy.contains(
          'You need to move everyone out of this location before you can convert it to a non-residential room.',
        )
      })

      it('has a cancel link', () => {
        const cellOccupiedPage = Page.verifyOnPage(NonResidentialConversionOccupiedPage)
        cellOccupiedPage.cancelLink().click()

        Page.verifyOnPage(ViewLocationsShowPage)
      })
    }

    context('when the cell is occupied', () => {
      beforeEach(() => {
        const prisonerLocations = [
          {
            cellLocation: '1-1-001',
            prisoners: [
              {
                prisonerNumber: 'A1234AA',
                prisonId: 'TST',
                prisonName: 'HMP Leeds',
                cellLocation: '1-1-001',
                firstName: 'Dave',
                lastName: 'Jones',
                gender: 'Male',
                csra: 'High',
                category: 'C',
                alerts: [
                  {
                    alertType: 'X',
                    alertCode: 'XA',
                    active: true,
                    expired: false,
                  },
                ],
              },
            ],
          },
        ]
        cy.task('stubPrisonerLocationsId', prisonerLocations)
        NonResidentialConversionWarningPage.goTo('7e570000-0000-0000-0000-000000000001')
      })

      itDisplaysTheCellOccupiedPage()
    })

    it('can be accessed via the actions dropdown on the show location page', () => {
      ViewLocationsShowPage.goTo(location.prisonId, location.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.actionsMenu().click()
      viewLocationsShowPage.convertToNonResAction().click()

      Page.verifyOnPage(NonResidentialConversionWarningPage)
    })

    describe('warning page', () => {
      beforeEach(() => {
        NonResidentialConversionWarningPage.goTo('7e570000-0000-0000-0000-000000000001')
      })

      it('has the correct panel text', () => {
        Page.verifyOnPage(NonResidentialConversionWarningPage)
        cy.contains(
          'This needs to be authorised by a governor as the cell will be decertified and the establishment’s capacity reduced',
        )
      })

      it('has a cancel link', () => {
        const warningPage = Page.verifyOnPage(NonResidentialConversionWarningPage)
        warningPage.cancelLink().click()

        Page.verifyOnPage(ViewLocationsShowPage)
      })

      it('continues to the details page when the button is clicked', () => {
        const warningPage = Page.verifyOnPage(NonResidentialConversionWarningPage)
        warningPage.continueButton().click()

        Page.verifyOnPage(NonResidentialConversionDetailsPage)
      })
    })

    describe('details page', () => {
      beforeEach(() => {
        NonResidentialConversionWarningPage.goTo('7e570000-0000-0000-0000-000000000001')
        const warningPage = Page.verifyOnPage(NonResidentialConversionWarningPage)
        warningPage.continueButton().click()
      })

      it('has a back link to the warning page', () => {
        const detailsPage = Page.verifyOnPage(NonResidentialConversionDetailsPage)
        detailsPage.backLink().click()

        Page.verifyOnPage(NonResidentialConversionWarningPage)
      })

      it('has a caption showing the cell description', () => {
        Page.verifyOnPage(NonResidentialConversionDetailsPage)
        cy.get('.govuk-caption-m').contains('1-1-001')
      })

      it('shows the correct radio buttons', () => {
        const detailsPage = Page.verifyOnPage(NonResidentialConversionDetailsPage)

        detailsPage.cellTypeRadioLabels().eq(0).contains('Kitchen / Servery')
        detailsPage.cellTypeRadioLabels().eq(1).contains('Office')
        detailsPage.cellTypeRadioLabels().eq(2).contains('Other')
      })

      it('has a cancel link', () => {
        const detailsPage = Page.verifyOnPage(NonResidentialConversionDetailsPage)
        detailsPage.cancelLink().click()

        Page.verifyOnPage(ViewLocationsShowPage)
      })

      it('shows the correct validation error when nothing is selected', () => {
        const detailsPage = Page.verifyOnPage(NonResidentialConversionDetailsPage)

        detailsPage.continueButton().click()

        cy.get('.govuk-error-summary__title').contains('There is a problem')
        cy.get('.govuk-error-summary__list').contains('Select a non-residential room type')
        cy.get('#convertedCellType-error').contains('Select a non-residential room type')
      })

      it('shows the correct validation error when other is selected with no description', () => {
        const detailsPage = Page.verifyOnPage(NonResidentialConversionDetailsPage)

        detailsPage.cellTypeRadioItem('OTHER').click()
        detailsPage.continueButton().click()

        cy.get('.govuk-error-summary__title').contains('There is a problem')
        cy.get('.govuk-error-summary__list').contains('Enter a room description')
        cy.get('#otherConvertedCellType-error').contains('Enter a room description')
      })

      it('shows the correct validation error when other is selected with description over 30 characters', () => {
        const detailsPage = Page.verifyOnPage(NonResidentialConversionDetailsPage)

        detailsPage.cellTypeRadioItem('OTHER').click()
        detailsPage.otherFreeText().clear().type('This description is over 30 characters')
        detailsPage.continueButton().click()

        cy.get('.govuk-error-summary__title').contains('There is a problem')
        cy.get('.govuk-error-summary__list').contains('Room description must be 30 characters or less')
        cy.get('#otherConvertedCellType-error').contains('Room description must be 30 characters or less')
      })
    })

    describe('confirmation page', () => {
      beforeEach(() => {
        NonResidentialConversionWarningPage.goTo('7e570000-0000-0000-0000-000000000001')
        const warningPage = Page.verifyOnPage(NonResidentialConversionWarningPage)
        warningPage.continueButton().click()
        const detailsPage = Page.verifyOnPage(NonResidentialConversionDetailsPage)
        detailsPage.cellTypeRadioItem('OFFICE').click()
        detailsPage.continueButton().click()
      })

      it('has a cancel link', () => {
        const detailsPage = Page.verifyOnPage(NonResidentialConversionConfirmPage)
        detailsPage.cancelLink().click()

        Page.verifyOnPage(ViewLocationsShowPage)
      })

      it('has a back link to the details page', () => {
        const confirmationPage = Page.verifyOnPage(NonResidentialConversionConfirmPage)
        confirmationPage.backLink().click()

        Page.verifyOnPage(NonResidentialConversionDetailsPage)
      })

      it('remembers the details when back is clicked', () => {
        let confirmationPage = Page.verifyOnPage(NonResidentialConversionConfirmPage)
        confirmationPage.backLink().click()

        let detailsPage = Page.verifyOnPage(NonResidentialConversionDetailsPage)
        detailsPage.cellTypeRadioItem('OFFICE').should('be.checked')

        detailsPage.cellTypeRadioItem('OTHER').click()
        detailsPage.otherFreeText().clear().type('pet therapy room')
        detailsPage.continueButton().click()

        confirmationPage = Page.verifyOnPage(NonResidentialConversionConfirmPage)
        confirmationPage.backLink().click()

        detailsPage = Page.verifyOnPage(NonResidentialConversionDetailsPage)
        detailsPage.cellTypeRadioItem('OTHER').should('be.checked')
        detailsPage.otherFreeText().should('have.value', 'pet therapy room')
      })

      it('shows the correct summary list', () => {
        Page.verifyOnPage(NonResidentialConversionConfirmPage)

        cy.get('.govuk-summary-list__key').eq(0).contains('Non-residential room')
        cy.get('.govuk-summary-list__value').eq(0).contains('Office')
      })

      it('has a change link and shows the correct summary list after change', () => {
        let confirmationPage = Page.verifyOnPage(NonResidentialConversionConfirmPage)
        confirmationPage.changeLink().click()

        const detailsPage = Page.verifyOnPage(NonResidentialConversionDetailsPage)
        detailsPage.cellTypeRadioItem('OTHER').click()
        detailsPage.otherFreeText().clear().type('pet therapy room')
        detailsPage.continueButton().click()

        confirmationPage = Page.verifyOnPage(NonResidentialConversionConfirmPage)
        cy.get('.govuk-summary-list__key').eq(0).contains('Non-residential room')
        cy.get('.govuk-summary-list__value').eq(0).contains('Other - pet therapy room')
      })

      it('shows the correct change summary', () => {
        Page.verifyOnPage(NonResidentialConversionConfirmPage)

        cy.get('.change-summary h2').contains('Change to establishment capacity')
        cy.get('.change-summary p').contains(/^This will decrease the establishment’s working capacity from 8 to 7./)
        cy.get('.change-summary p').contains(/This will decrease the establishment’s maximum capacity from 9 to 7.$/)
      })

      it('has the correct warning text', () => {
        cy.get('.govuk-warning-text__text').contains('This cell will be decertified')
      })

      it('shows the success banner on completion', () => {
        const confirmationPage = Page.verifyOnPage(NonResidentialConversionConfirmPage)
        confirmationPage.confirmButton().click()

        Page.verifyOnPage(ViewLocationsShowPage)
        cy.get('#govuk-notification-banner-title').contains('Success')
        cy.get('.govuk-notification-banner__content h3').contains('Cell converted to non-residential room')
        cy.get('.govuk-notification-banner__content p').contains(
          'You have converted 1-1-001 into a non-residential room.',
        )
      })

      context('when the cell becomes occupied during the process', () => {
        beforeEach(() => {
          cy.task('stubLocationsConvertCellToNonResCellOccupied')

          const confirmationPage = Page.verifyOnPage(NonResidentialConversionConfirmPage)
          confirmationPage.confirmButton().click()
        })

        itDisplaysTheCellOccupiedPage()
      })
    })
  })
})
