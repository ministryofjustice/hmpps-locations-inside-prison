import LocationFactory from '../../../server/testutils/factories/location'
import Page from '../../pages/page'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import ChangeTemporaryDeactivationDetailsPage from '../../pages/changeTemporaryDeactivationDetails/details'

context('Change temporary deactivations details', () => {
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

  context('without the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
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
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
        parentLocation: location,
        prisonSummary: {
          workingCapacity: 9,
          signedOperationalCapacity: 11,
          maxCapacity: 10,
        },
      })
      cy.task('stubLocations', location)
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
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
        parentLocation: location,
        prisonSummary: {
          workingCapacity: 9,
          signedOperationalCapacity: 11,
          maxCapacity: 10,
        },
      })
      cy.task('stubLocations', location)
      cy.task('stubPrisonerLocationsId', [])
      cy.task('stubLocationsDeactivateTemporary')
      cy.signIn()
    })

    describe('details page', () => {
      // beforeEach(() => {
      //   // ChangeTemporaryDeactivationDetailsPage.goTo('7e570000-0000-0000-0000-000000000001')
      // })

      // it('has a back link to the view location detail page', () => {
      //   const detailsPage = Page.verifyOnPage(ChangeTemporaryDeactivationDetailsPage)
      //   detailsPage.backLink().click()

      //   // Page.verifyOnPage(ViewLocationsShowPage)
      // })

      it('has a caption showing the cell description', () => {
        Page.verifyOnPage(ChangeTemporaryDeactivationDetailsPage)
        cy.get('.govuk-caption-m').contains('Cell A-1-001')
      })

      // it('has a cancel link', () => {
      //   const detailsPage = Page.verifyOnPage(ChangeTemporaryDeactivationDetailsPage)
      //   detailsPage.cancelLink().click()

      //   Page.verifyOnPage(ViewLocationsShowPage)
      // })

      // it('shows the correct validation error when other is selected with no description', () => {
      //   const detailsPage = Page.verifyOnPage(ChangeTemporaryDeactivationDetailsPage)

      //   detailsPage.reasonRadioItem('OTHER').click()

      //   cy.get('.govuk-error-summary__title').contains(' There is a problem ')
      //   cy.get('.govuk-error-summary__list').contains('Enter a deactivation reason')
      //   cy.get('#deactivationReasonOther-error').contains('Enter a deactivation reason')
      // })

      // it('shows the correct validation error when deactivationReasonDescription is over 255 chars', () => {
      //   const detailsPage = Page.verifyOnPage(ChangeTemporaryDeactivationDetailsPage)

      //   detailsPage.reasonRadioItem('TEST1').click()
      //   detailsPage.descriptionFreeText('TEST1').clear().type(Array(257).join('a'))
      //   detailsPage.continueButton().click()

      //   cy.get('.govuk-error-summary__title').contains('There is a problem')
      //   cy.get('.govuk-error-summary__list').contains('Description must be 255 characters or less')
      //   cy.get('#deactivationReasonDescription-TEST1-error').contains('Description must be 255 characters or less')
      // })

      // it('shows the correct validation error when deactivationReasonOther is over 255 chars', () => {
      //   const detailsPage = Page.verifyOnPage(ChangeTemporaryDeactivationDetailsPage)

      //   detailsPage.reasonRadioItem('OTHER').click()
      //   detailsPage.otherFreeText().clear().type(Array(257).join('a'))
      //   detailsPage.continueButton().click()

      //   cy.get('.govuk-error-summary__title').contains('There is a problem')
      //   cy.get('.govuk-error-summary__list').contains('Deactivation reason must be 255 characters or less')
      //   cy.get('#deactivationReasonOther-error').contains('Deactivation reason must be 255 characters or less')
      // })

      // it('shows the correct validation error when estimatedReactivationDate is in the past', () => {
      //   const detailsPage = Page.verifyOnPage(ChangeTemporaryDeactivationDetailsPage)

      //   detailsPage.reasonRadioItem('TEST1').click()
      //   detailsPage.estimatedReactivationDateDayText().clear().type('1')
      //   detailsPage.estimatedReactivationDateMonthText().clear().type('1')
      //   detailsPage.estimatedReactivationDateYearText().clear().type('2024')
      //   detailsPage.continueButton().click()

      //   cy.get('.govuk-error-summary__title').contains('There is a problem')
      //   cy.get('.govuk-error-summary__list').contains('Estimated reactivation date must be today or in the future')
      //   cy.get('#estimatedReactivationDate-error').contains(
      //     'Estimated reactivation date must be today or in the future',
      //   )
      // })

      // it('shows the correct validation error when planetFmReference is less than 6 characters', () => {
      //   const detailsPage = Page.verifyOnPage(ChangeTemporaryDeactivationDetailsPage)

      //   detailsPage.reasonRadioItem('TEST1').click()
      //   detailsPage.planetFmReferenceText().clear().type('12345')
      //   detailsPage.continueButton().click()

      //   cy.get('.govuk-error-summary__title').contains('There is a problem')
      //   cy.get('.govuk-error-summary__list').contains('Planet FM reference number must be at least 6 characters')
      //   cy.get('#planetFmReference-error').contains('Planet FM reference number must be at least 6 characters')
      // })

      // it('does not require a description for non-OTHER reasons, date or planet rm reference', () => {
      //   const detailsPage = Page.verifyOnPage(ChangeTemporaryDeactivationDetailsPage)

      //   detailsPage.reasonRadioItem('TEST1').click()
      //   detailsPage.descriptionFreeText('TEST1').clear()
      //   detailsPage.estimatedReactivationDateDayText().clear()
      //   detailsPage.estimatedReactivationDateMonthText().clear()
      //   detailsPage.estimatedReactivationDateYearText().clear()
      //   detailsPage.planetFmReferenceText().clear()
      //   detailsPage.continueButton().click()

      //   Page.verifyOnPage(ChangeTemporaryDeactivationDetailsPage)
      // })
    })
  })
})
