import LocationFactory from '../../../../server/testutils/factories/location'
import Page from '../../../pages/page'
import ViewLocationsShowPage from '../../../pages/viewLocations/show'
import ReactivateCellDetailsPage from '../../../pages/reactivate/cell/details'
import ReactivateCellConfirmPage from '../../../pages/reactivate/cell/confirm'

context('Reactivate cell', () => {
  const genericLocation = LocationFactory.build({
    id: '57718979-573c-433a-9e51-2d83f887c11c',
    parentId: undefined,
    topLevelId: undefined,
  })

  let location: ReturnType<typeof LocationFactory.build>

  context('without the MANAGE_RESIDENTIAL_LOCATIONS role', () => {
    beforeEach(() => {
      location = LocationFactory.build({
        accommodationTypes: ['NORMAL_ACCOMMODATION'],
        capacity: {
          maxCapacity: 3,
          workingCapacity: 0,
        },
        oldWorkingCapacity: 2,
        leafLevel: true,
        specialistCellTypes: [],
        localName: undefined,
        status: 'INACTIVE',
        active: false,
      })
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

    it('does not show the activate button in the inactive location banner', () => {
      ViewLocationsShowPage.goTo(location.prisonId, location.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.inactiveBannerActivateCellButton().should('not.exist')
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
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', { parentLocation: location })
      cy.task('stubLocations', location)
      cy.task('stubLocations', genericLocation)
      cy.task('stubLocationsBulkReactivate')
      cy.signIn()
    })

    it('can be accessed via the activate button in the inactive location banner', () => {
      ViewLocationsShowPage.goTo(location.prisonId, location.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.inactiveBannerActivateCellButton().click()

      Page.verifyOnPage(ReactivateCellDetailsPage)
    })

    it('has a back link to the show location page', () => {
      ReactivateCellDetailsPage.goTo('7e570000-0000-0000-0000-000000000001')
      const reactivateCellDetailsPage = Page.verifyOnPage(ReactivateCellDetailsPage)
      reactivateCellDetailsPage.backLink().click()

      Page.verifyOnPage(ViewLocationsShowPage)
    })

    it('has the correct main heading and a caption showing the cell description', () => {
      ReactivateCellDetailsPage.goTo('7e570000-0000-0000-0000-000000000001')

      cy.get('h1').contains('Check cell capacity')
      cy.get('.govuk-caption-m').contains('Cell A-1-001')
    })

    it('has a cancel link', () => {
      ReactivateCellDetailsPage.goTo('7e570000-0000-0000-0000-000000000001')
      const reactivateCellDetailsPage = Page.verifyOnPage(ReactivateCellDetailsPage)
      reactivateCellDetailsPage.cancelLink().click()

      Page.verifyOnPage(ViewLocationsShowPage)
    })

    describe('validations', () => {
      it('shows the correct validation error when missing working capacity', () => {
        ReactivateCellDetailsPage.goTo('7e570000-0000-0000-0000-000000000001')
        const reactivateCellDetailsPage = Page.verifyOnPage(ReactivateCellDetailsPage)

        reactivateCellDetailsPage.maxCapacityInput().clear().type('4')
        reactivateCellDetailsPage.workingCapacityInput().clear()
        reactivateCellDetailsPage.continueButton().click()

        cy.get('.govuk-error-summary__title').contains('There is a problem')
        cy.get('.govuk-error-summary__list').contains('Enter a working capacity')
        cy.get('#workingCapacity-error').contains('Enter a working capacity')
      })

      it('shows the correct validation error when working capacity > 99', () => {
        ReactivateCellDetailsPage.goTo('7e570000-0000-0000-0000-000000000001')
        const reactivateCellDetailsPage = Page.verifyOnPage(ReactivateCellDetailsPage)

        reactivateCellDetailsPage.maxCapacityInput().clear().type('4')
        reactivateCellDetailsPage.workingCapacityInput().clear().type('100')
        reactivateCellDetailsPage.continueButton().click()

        cy.get('.govuk-error-summary__title').contains('There is a problem')
        cy.get('.govuk-error-summary__list').contains('Working capacity cannot be more than 99')
        cy.get('#workingCapacity-error').contains('Working capacity cannot be more than 99')
      })

      it('shows the correct validation error when working capacity is not a number', () => {
        ReactivateCellDetailsPage.goTo('7e570000-0000-0000-0000-000000000001')
        const reactivateCellDetailsPage = Page.verifyOnPage(ReactivateCellDetailsPage)

        reactivateCellDetailsPage.maxCapacityInput().clear().type('4')
        reactivateCellDetailsPage.workingCapacityInput().clear().type('hello')
        reactivateCellDetailsPage.continueButton().click()

        cy.get('.govuk-error-summary__title').contains('There is a problem')
        cy.get('.govuk-error-summary__list').contains('Working capacity must be a number')
        cy.get('#workingCapacity-error').contains('Working capacity must be a number')
      })

      it('shows the correct validation error when working capacity is greater than max capacity', () => {
        ReactivateCellDetailsPage.goTo('7e570000-0000-0000-0000-000000000001')
        const reactivateCellDetailsPage = Page.verifyOnPage(ReactivateCellDetailsPage)

        reactivateCellDetailsPage.maxCapacityInput().clear().type('3')
        reactivateCellDetailsPage.workingCapacityInput().clear().type('4')
        reactivateCellDetailsPage.continueButton().click()

        cy.get('.govuk-error-summary__title').contains('There is a problem')
        cy.get('.govuk-error-summary__list').contains('Working capacity cannot be more than the maximum capacity')
        cy.get('#workingCapacity-error').contains('Working capacity cannot be more than the maximum capacity')
      })

      it('shows the correct validation error when working capacity is zero for non-specialist cell', () => {
        ReactivateCellDetailsPage.goTo('7e570000-0000-0000-0000-000000000001')
        const reactivateCellDetailsPage = Page.verifyOnPage(ReactivateCellDetailsPage)

        reactivateCellDetailsPage.maxCapacityInput().clear().type('3')
        reactivateCellDetailsPage.workingCapacityInput().clear().type('0')
        reactivateCellDetailsPage.continueButton().click()

        cy.get('.govuk-error-summary__title').contains('There is a problem')
        cy.get('.govuk-error-summary__list').contains('Working capacity cannot be 0 for a non-specialist cell')
        cy.get('#workingCapacity-error').contains('Working capacity cannot be 0 for a non-specialist cell')
      })

      it('shows the correct validation error when missing max capacity', () => {
        ReactivateCellDetailsPage.goTo('7e570000-0000-0000-0000-000000000001')
        const reactivateCellDetailsPage = Page.verifyOnPage(ReactivateCellDetailsPage)

        reactivateCellDetailsPage.maxCapacityInput().clear()
        reactivateCellDetailsPage.workingCapacityInput().clear().type('2')
        reactivateCellDetailsPage.continueButton().click()

        cy.get('.govuk-error-summary__title').contains('There is a problem')
        cy.get('.govuk-error-summary__list').contains('Enter a maximum capacity')
        cy.get('#maxCapacity-error').contains('Enter a maximum capacity')
      })

      it('shows the correct validation error when max capacity > 99', () => {
        ReactivateCellDetailsPage.goTo('7e570000-0000-0000-0000-000000000001')
        const reactivateCellDetailsPage = Page.verifyOnPage(ReactivateCellDetailsPage)

        reactivateCellDetailsPage.maxCapacityInput().clear().type('100')
        reactivateCellDetailsPage.workingCapacityInput().clear().type('2')
        reactivateCellDetailsPage.continueButton().click()

        cy.get('.govuk-error-summary__title').contains('There is a problem')
        cy.get('.govuk-error-summary__list').contains('Maximum capacity cannot be more than 99')
        cy.get('#maxCapacity-error').contains('Maximum capacity cannot be more than 99')
      })

      it('shows the correct validation error when max capacity is not a number', () => {
        ReactivateCellDetailsPage.goTo('7e570000-0000-0000-0000-000000000001')
        const reactivateCellDetailsPage = Page.verifyOnPage(ReactivateCellDetailsPage)

        reactivateCellDetailsPage.maxCapacityInput().clear().type('hello')
        reactivateCellDetailsPage.workingCapacityInput().clear().type('2')
        reactivateCellDetailsPage.continueButton().click()

        cy.get('.govuk-error-summary__title').contains('There is a problem')
        cy.get('.govuk-error-summary__list').contains('Maximum capacity must be a number')
        cy.get('#maxCapacity-error').contains('Maximum capacity must be a number')
      })

      it('shows the correct validation error when max capacity is zero', () => {
        ReactivateCellDetailsPage.goTo('7e570000-0000-0000-0000-000000000001')
        const reactivateCellDetailsPage = Page.verifyOnPage(ReactivateCellDetailsPage)

        reactivateCellDetailsPage.maxCapacityInput().clear().type('0')
        reactivateCellDetailsPage.workingCapacityInput().clear().type('0')
        reactivateCellDetailsPage.continueButton().click()

        cy.get('.govuk-error-summary__title').contains('There is a problem')
        cy.get('.govuk-error-summary__list').contains('Maximum capacity cannot be 0')
        cy.get('#maxCapacity-error').contains('Maximum capacity cannot be 0')
      })
    })

    describe('confirm cell capacity', () => {
      it('has the correct title', () => {
        ReactivateCellDetailsPage.goTo('7e570000-0000-0000-0000-000000000001')
        const reactivateCellDetailsPage = Page.verifyOnPage(ReactivateCellDetailsPage)
        reactivateCellDetailsPage.workingCapacityInput().clear().type('2')
        reactivateCellDetailsPage.continueButton().click()

        Page.verifyOnPage(ReactivateCellConfirmPage)

        cy.get('h1').contains('You are about to reactivate cell A-1-001')
      })

      it('has a back link to the details page', () => {
        ReactivateCellDetailsPage.goTo('7e570000-0000-0000-0000-000000000001')
        const reactivateCellDetailsPage = Page.verifyOnPage(ReactivateCellDetailsPage)
        reactivateCellDetailsPage.workingCapacityInput().clear().type('2')
        reactivateCellDetailsPage.continueButton().click()

        const reactivateCellConfirmPage = Page.verifyOnPage(ReactivateCellConfirmPage)
        reactivateCellConfirmPage.backLink().click()

        Page.verifyOnPage(ReactivateCellDetailsPage)
      })

      it('shows the correct change summary when changing no values', () => {
        location.specialistCellTypes = ['TEST']
        cy.task('stubLocations', location)

        ReactivateCellDetailsPage.goTo('7e570000-0000-0000-0000-000000000001')
        const reactivateCellDetailsPage = Page.verifyOnPage(ReactivateCellDetailsPage)
        reactivateCellDetailsPage.workingCapacityInput().clear().type('0')
        reactivateCellDetailsPage.continueButton().click()

        Page.verifyOnPage(ReactivateCellConfirmPage)

        cy.get('.change-summary h2').contains('Change to establishment capacity')
        cy.get('.change-summary p').contains(
          /There will be no change to the establishment's total working or maximum capacity.\s+$/,
        )
      })

      it('shows the correct change summary when changing one value', () => {
        ReactivateCellDetailsPage.goTo('7e570000-0000-0000-0000-000000000001')
        const reactivateCellDetailsPage = Page.verifyOnPage(ReactivateCellDetailsPage)
        reactivateCellDetailsPage.workingCapacityInput().clear().type('2')
        reactivateCellDetailsPage.continueButton().click()

        Page.verifyOnPage(ReactivateCellConfirmPage)

        cy.get('.change-summary h2').contains('Change to establishment capacity')
        cy.get('.change-summary p').contains(
          /The establishment's total working capacity will increase from 8 to 10.\s+$/,
        )
      })

      it('shows the correct change summary when changing both values', () => {
        ReactivateCellDetailsPage.goTo('7e570000-0000-0000-0000-000000000001')
        const reactivateCellDetailsPage = Page.verifyOnPage(ReactivateCellDetailsPage)
        reactivateCellDetailsPage.workingCapacityInput().clear().type('2')
        reactivateCellDetailsPage.maxCapacityInput().clear().type('4')
        reactivateCellDetailsPage.continueButton().click()

        Page.verifyOnPage(ReactivateCellConfirmPage)

        cy.get('.change-summary h2').contains('Change to establishment capacity')
        cy.get('.change-summary p').contains(/The establishment's total working capacity will increase from 8 to 10./)
        cy.get('.change-summary p').contains(
          /The establishment's total maximum capacity will increase from 9 to 10.\s+$/,
        )
      })

      it('has a cancel link', () => {
        ReactivateCellDetailsPage.goTo('7e570000-0000-0000-0000-000000000001')
        const reactivateCellDetailsPage = Page.verifyOnPage(ReactivateCellDetailsPage)
        reactivateCellDetailsPage.workingCapacityInput().clear().type('2')
        reactivateCellDetailsPage.continueButton().click()

        const reactivateCellConfirmPage = Page.verifyOnPage(ReactivateCellConfirmPage)
        reactivateCellConfirmPage.cancelLink().click()

        Page.verifyOnPage(ViewLocationsShowPage)
      })

      it('shows the success banner when the change is complete', () => {
        ReactivateCellDetailsPage.goTo('7e570000-0000-0000-0000-000000000001')
        const reactivateCellDetailsPage = Page.verifyOnPage(ReactivateCellDetailsPage)
        reactivateCellDetailsPage.workingCapacityInput().clear().type('2')
        reactivateCellDetailsPage.maxCapacityInput().clear().type('4')
        reactivateCellDetailsPage.continueButton().click()

        const reactivateCellConfirmPage = Page.verifyOnPage(ReactivateCellConfirmPage)
        reactivateCellConfirmPage.confirmButton().click()

        Page.verifyOnPage(ViewLocationsShowPage)
        cy.get('#govuk-notification-banner-title').contains('Success')
        cy.get('.govuk-notification-banner__content h3').contains('Cell activated')
        cy.get('.govuk-notification-banner__content p').contains('You have activated cell A-1-001.')
      })
    })
  })
})
