import LocationFactory from '../../../server/testutils/factories/location'
import Page from '../../pages/page'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import DeactivateOccupiedPage from '../../pages/deactivate/occupied'
import DeactivateTemporaryDetailsPage from '../../pages/deactivate/temporary/details'
import DeactivateTemporaryConfirmPage from '../../pages/deactivate/temporary/confirm'
import DeactivateTypePage from '../../pages/deactivate/type'

context('Deactivate temporary', () => {
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

  beforeEach(() => {
    cy.task('reset')
    cy.task('setFeatureFlag', { permanentDeactivation: true })
  })

  context('without the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
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
      cy.task('stubLocationsLocationsResidentialSummary', {
        prisonSummary: {
          workingCapacity: 9,
          signedOperationalCapacity: 11,
          maxCapacity: 10,
        },
      })
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
        parentLocation: location,
      })
      cy.task('stubLocations', location)
      cy.task('stubGetPrisonConfiguration', { prisonId: 'TST', certificationActive: 'ACTIVE' })
      cy.signIn()
    })

    it('does not show the action in the menu on the show location page', () => {
      ViewLocationsShowPage.goTo(location.prisonId, location.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.deactivateAction().should('not.exist')
    })
  })

  context('with the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
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
      cy.task('stubLocationsLocationsResidentialSummary', {
        prisonSummary: {
          workingCapacity: 9,
          signedOperationalCapacity: 11,
          maxCapacity: 10,
        },
      })
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
        parentLocation: location,
      })
      cy.task('stubLocations', location)
      cy.task('stubPrisonerLocationsId', [])
      cy.task('stubLocationsDeactivateTemporary')
      cy.task('stubGetPrisonConfiguration', { prisonId: 'TST', certificationActive: 'ACTIVE' })

      cy.signIn()
    })

    function itDisplaysTheCellOccupiedPage() {
      it('has a caption showing the cell description', () => {
        Page.verifyOnPage(DeactivateOccupiedPage)
        cy.get('.govuk-caption-m').contains('Cell A-1-001')
      })

      it('shows the correct error message', () => {
        Page.verifyOnPage(DeactivateOccupiedPage)
        cy.contains('You need to move everyone out of this location before you can deactivate it.')
      })

      it('has a cancel link', () => {
        const cellOccupiedPage = Page.verifyOnPage(DeactivateOccupiedPage)
        cellOccupiedPage.cancelLink().click()

        Page.verifyOnPage(ViewLocationsShowPage)
      })
    }

    context('when the cell is occupied', () => {
      beforeEach(() => {
        const prisonerLocations = [
          {
            cellLocation: 'A-1-001',
            prisoners: [
              {
                prisonerNumber: 'A1234AA',
                prisonId: 'TST',
                prisonName: 'HMP Leeds',
                cellLocation: 'A-1-001',
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
        DeactivateTemporaryDetailsPage.goTo('7e570000-0000-0000-0000-000000000001')
      })

      itDisplaysTheCellOccupiedPage()
    })

    it('can be accessed by selecting temporary when prompted after clicking the actions dropdown', () => {
      ViewLocationsShowPage.goTo(location.prisonId, location.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.actionsMenu().click()
      viewLocationsShowPage.deactivateAction().click()
      const deactivateTypePage = Page.verifyOnPage(DeactivateTypePage)
      deactivateTypePage.tempRadioButton().click()
      deactivateTypePage.continueButton().click()
      Page.verifyOnPage(DeactivateTemporaryDetailsPage)
    })

    it('has back links via the deactivation type page from the details page', () => {
      ViewLocationsShowPage.goTo(location.prisonId, location.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.actionsMenu().click()
      viewLocationsShowPage.deactivateAction().click()
      let deactivateTypePage = Page.verifyOnPage(DeactivateTypePage)
      deactivateTypePage.tempRadioButton().click()
      deactivateTypePage.continueButton().click()
      const detailsPage = Page.verifyOnPage(DeactivateTemporaryDetailsPage)
      detailsPage.backLink().click()
      Page.verifyOnPage(DeactivateTypePage)
      deactivateTypePage = Page.verifyOnPage(DeactivateTypePage)
      deactivateTypePage.backLink().click()
      Page.verifyOnPage(ViewLocationsShowPage)
    })

    context('when the permanentDeactivation feature flag is disabled', () => {
      beforeEach(() => {
        cy.task('setFeatureFlag', { permanentDeactivation: false })
      })

      it('goes straight to temp deactivation when clicking the actions dropdown', () => {
        ViewLocationsShowPage.goTo(location.prisonId, location.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.actionsMenu().click()
        viewLocationsShowPage.deactivateAction().click()

        Page.verifyOnPage(DeactivateTemporaryDetailsPage)
      })

      it('goes straight back to the view location page when clicking back', () => {
        ViewLocationsShowPage.goTo(location.prisonId, location.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.actionsMenu().click()
        viewLocationsShowPage.deactivateAction().click()
        const deactivateTemporaryPage = Page.verifyOnPage(DeactivateTemporaryDetailsPage)
        deactivateTemporaryPage.backLink().click()
        Page.verifyOnPage(ViewLocationsShowPage)
      })
    })

    describe('details page', () => {
      beforeEach(() => {
        DeactivateTemporaryDetailsPage.goTo('7e570000-0000-0000-0000-000000000001')
      })

      it('has a back link to the view location page', () => {
        const detailsPage = Page.verifyOnPage(DeactivateTemporaryDetailsPage)
        detailsPage.backLink().click()

        Page.verifyOnPage(ViewLocationsShowPage)
      })

      it('has a caption showing the cell description', () => {
        Page.verifyOnPage(DeactivateTemporaryDetailsPage)
        cy.get('.govuk-caption-m').contains('Cell A-1-001')
      })

      it('shows the correct radio buttons', () => {
        const detailsPage = Page.verifyOnPage(DeactivateTemporaryDetailsPage)

        detailsPage.reasonRadioLabels().eq(0).contains('Test type 1')
        detailsPage.reasonRadioLabels().eq(1).contains('Test type 2')
        detailsPage.reasonRadioLabels().eq(2).contains('Other')
      })

      it('has a cancel link', () => {
        const detailsPage = Page.verifyOnPage(DeactivateTemporaryDetailsPage)
        detailsPage.cancelLink().click()

        Page.verifyOnPage(ViewLocationsShowPage)
      })

      it('shows the correct validation error when nothing is selected', () => {
        const detailsPage = Page.verifyOnPage(DeactivateTemporaryDetailsPage)

        detailsPage.continueButton().click()

        cy.get('.govuk-error-summary__title').contains('There is a problem')
        cy.get('.govuk-error-summary__list').contains('Select a deactivation reason')
        cy.get('#deactivationReason-error').contains('Select a deactivation reason')
      })

      it('shows the correct validation error when other is selected with no description', () => {
        const detailsPage = Page.verifyOnPage(DeactivateTemporaryDetailsPage)

        detailsPage.reasonRadioItem('OTHER').click()
        detailsPage.continueButton().click()

        cy.get('.govuk-error-summary__title').contains('There is a problem')
        cy.get('.govuk-error-summary__list').contains('Enter a deactivation reason')
        cy.get('#deactivationReasonOther-error').contains('Enter a deactivation reason')
      })

      it('shows the correct validation error when deactivationReasonDescription is over 255 chars', () => {
        const detailsPage = Page.verifyOnPage(DeactivateTemporaryDetailsPage)

        detailsPage.reasonRadioItem('TEST1').click()
        detailsPage.descriptionFreeText('TEST1').clear().type(Array(257).join('a'))
        detailsPage.continueButton().click()

        cy.get('.govuk-error-summary__title').contains('There is a problem')
        cy.get('.govuk-error-summary__list').contains('Description must be 255 characters or less')
        cy.get('#deactivationReasonDescription-TEST1-error').contains('Description must be 255 characters or less')
      })

      it('shows the correct validation error when deactivationReasonOther is over 255 chars', () => {
        const detailsPage = Page.verifyOnPage(DeactivateTemporaryDetailsPage)

        detailsPage.reasonRadioItem('OTHER').click()
        detailsPage.otherFreeText().clear().type(Array(257).join('a'))
        detailsPage.continueButton().click()

        cy.get('.govuk-error-summary__title').contains('There is a problem')
        cy.get('.govuk-error-summary__list').contains('Deactivation reason must be 255 characters or less')
        cy.get('#deactivationReasonOther-error').contains('Deactivation reason must be 255 characters or less')
      })

      it('shows the correct validation error when estimatedReactivationDate is in the past', () => {
        const detailsPage = Page.verifyOnPage(DeactivateTemporaryDetailsPage)

        detailsPage.reasonRadioItem('TEST1').click()
        detailsPage.estimatedReactivationDateDayText().clear().type('1')
        detailsPage.estimatedReactivationDateMonthText().clear().type('1')
        detailsPage.estimatedReactivationDateYearText().clear().type('2024')
        detailsPage.continueButton().click()

        cy.get('.govuk-error-summary__title').contains('There is a problem')
        cy.get('.govuk-error-summary__list').contains('Estimated reactivation date must be today or in the future')
        cy.get('#estimatedReactivationDate-error').contains(
          'Estimated reactivation date must be today or in the future',
        )
      })

      it('shows the correct validation error when planetFmReference is less than 6 characters', () => {
        const detailsPage = Page.verifyOnPage(DeactivateTemporaryDetailsPage)

        detailsPage.reasonRadioItem('TEST1').click()
        detailsPage.planetFmReferenceText().clear().type('12345')
        detailsPage.continueButton().click()

        cy.get('.govuk-error-summary__title').contains('There is a problem')
        cy.get('.govuk-error-summary__list').contains('Planet FM reference number must be at least 6 characters')
        cy.get('#planetFmReference-error').contains('Planet FM reference number must be at least 6 characters')
      })

      it('does not require a description for non-OTHER reasons, date or planet rm reference', () => {
        const detailsPage = Page.verifyOnPage(DeactivateTemporaryDetailsPage)

        detailsPage.reasonRadioItem('TEST1').click()
        detailsPage.descriptionFreeText('TEST1').clear()
        detailsPage.estimatedReactivationDateDayText().clear()
        detailsPage.estimatedReactivationDateMonthText().clear()
        detailsPage.estimatedReactivationDateYearText().clear()
        detailsPage.planetFmReferenceText().clear()
        detailsPage.continueButton().click()

        Page.verifyOnPage(DeactivateTemporaryConfirmPage)
      })

      it('deactivation reason description input contains an autocomplete off attribute', () => {
        cy.get('#deactivationReasonDescription-TEST2').should('have.attr', 'autocomplete', 'off')
      })

      it('estimated reactivation date - day input field contains an autocomplete off attribute', () => {
        cy.get('#estimatedReactivationDate-day').should('have.attr', 'autocomplete', 'off')
      })

      it('estimated reactivation date - month input field contains an autocomplete off attribute', () => {
        cy.get('#estimatedReactivationDate-month').should('have.attr', 'autocomplete', 'off')
      })

      it('estimated reactivation date - year input fieldcontains an autocomplete off attribute', () => {
        cy.get('#estimatedReactivationDate-year').should('have.attr', 'autocomplete', 'off')
      })

      it('planet FM reference number input field contains an autocomplete off attribute', () => {
        cy.get('#planetFmReference').should('have.attr', 'autocomplete', 'off')
      })
    })

    describe('confirmation page', () => {
      beforeEach(() => {
        DeactivateTemporaryDetailsPage.goTo('7e570000-0000-0000-0000-000000000001')
        const detailsPage = Page.verifyOnPage(DeactivateTemporaryDetailsPage)
        detailsPage.reasonRadioItem('TEST2').click()
        detailsPage.descriptionFreeText('TEST2').clear().type('Test description')
        detailsPage.estimatedReactivationDateDayText().clear().type('13')
        detailsPage.estimatedReactivationDateMonthText().clear().type('1')
        detailsPage.estimatedReactivationDateYearText().clear().type('3024')
        detailsPage.planetFmReferenceText().clear().type('123456')
        detailsPage.continueButton().click()
      })

      it('has a cancel link', () => {
        const detailsPage = Page.verifyOnPage(DeactivateTemporaryConfirmPage)
        detailsPage.cancelLink().click()

        Page.verifyOnPage(ViewLocationsShowPage)
      })

      it('has a back link to the details page', () => {
        const confirmationPage = Page.verifyOnPage(DeactivateTemporaryConfirmPage)
        confirmationPage.backLink().click()

        Page.verifyOnPage(DeactivateTemporaryDetailsPage)
      })

      it('remembers the details when back is clicked', () => {
        let confirmationPage = Page.verifyOnPage(DeactivateTemporaryConfirmPage)
        confirmationPage.backLink().click()

        let detailsPage = Page.verifyOnPage(DeactivateTemporaryDetailsPage)
        detailsPage.reasonRadioItem('TEST2').should('be.checked')

        detailsPage.reasonRadioItem('OTHER').click()
        detailsPage.otherFreeText().clear().type('room not feeling well today')
        detailsPage.estimatedReactivationDateDayText().clear().type('4')
        detailsPage.estimatedReactivationDateMonthText().clear().type('10')
        detailsPage.estimatedReactivationDateYearText().clear().type('3000')
        detailsPage.planetFmReferenceText().clear().type('654321')
        detailsPage.continueButton().click()

        confirmationPage = Page.verifyOnPage(DeactivateTemporaryConfirmPage)
        confirmationPage.backLink().click()

        detailsPage = Page.verifyOnPage(DeactivateTemporaryDetailsPage)
        detailsPage.reasonRadioItem('OTHER').should('be.checked')
        detailsPage.otherFreeText().should('have.value', 'room not feeling well today')
        detailsPage.estimatedReactivationDateDayText().should('have.value', '04')
        detailsPage.estimatedReactivationDateMonthText().should('have.value', '10')
        detailsPage.estimatedReactivationDateYearText().should('have.value', '3000')
        detailsPage.planetFmReferenceText().should('have.value', '654321')
      })

      it('shows the correct summary list', () => {
        Page.verifyOnPage(DeactivateTemporaryConfirmPage)

        cy.get('.govuk-summary-list__key').eq(0).contains('Reason')
        cy.get('.govuk-summary-list__value').eq(0).contains('Test type 2 - Test description')
        cy.get('.govuk-summary-list__key').eq(1).contains('Estimated reactivation date')
        cy.get('.govuk-summary-list__value').eq(1).contains('13 January 3024')
        cy.get('.govuk-summary-list__key').eq(2).contains('Planet FM reference number')
        cy.get('.govuk-summary-list__value').eq(2).contains('123456')
      })

      it('has a change link and shows the correct summary list after change', () => {
        const confirmationPage = Page.verifyOnPage(DeactivateTemporaryConfirmPage)
        confirmationPage.changeLink().click()

        const detailsPage = Page.verifyOnPage(DeactivateTemporaryDetailsPage)
        detailsPage.reasonRadioItem('OTHER').click()
        detailsPage.otherFreeText().clear().type('some other reason')
        detailsPage.estimatedReactivationDateDayText().clear().type('4')
        detailsPage.estimatedReactivationDateMonthText().clear().type('10')
        detailsPage.estimatedReactivationDateYearText().clear().type('3000')
        detailsPage.planetFmReferenceText().clear().type('654321')
        detailsPage.continueButton().click()

        Page.verifyOnPage(DeactivateTemporaryConfirmPage)
        cy.get('.govuk-summary-list__key').eq(0).contains('Reason')
        cy.get('.govuk-summary-list__value').eq(0).contains('Other - some other reason')
        cy.get('.govuk-summary-list__key').eq(1).contains('Estimated reactivation date')
        cy.get('.govuk-summary-list__value').eq(1).contains('4 October 3000')
        cy.get('.govuk-summary-list__key').eq(2).contains('Planet FM reference number')
        cy.get('.govuk-summary-list__value').eq(2).contains('654321')
      })

      it('shows the correct change summary', () => {
        Page.verifyOnPage(DeactivateTemporaryConfirmPage)

        cy.get('.change-summary h2').contains('Change to establishment capacity')
        cy.get('.change-summary p').contains(/^You are making 1 cell inactive./)
        cy.get('.change-summary p').contains(
          /This will reduce the establishment's total working capacity from 9 to 8.$/,
        )
      })

      it('shows the success banner on completion', () => {
        const confirmationPage = Page.verifyOnPage(DeactivateTemporaryConfirmPage)
        confirmationPage.confirmButton().click()

        Page.verifyOnPage(ViewLocationsShowPage)
        cy.get('#govuk-notification-banner-title').contains('Success')
        cy.get('.govuk-notification-banner__content h3').contains('Cell deactivated')
        cy.get('.govuk-notification-banner__content p').contains('You have deactivated cell A-1-001.')
      })

      context('when the cell becomes occupied during the process', () => {
        beforeEach(() => {
          cy.task('stubLocationsDeactivateTemporaryOccupied')

          const confirmationPage = Page.verifyOnPage(DeactivateTemporaryConfirmPage)
          confirmationPage.confirmButton().click()
        })

        itDisplaysTheCellOccupiedPage()
      })
    })
  })
})
