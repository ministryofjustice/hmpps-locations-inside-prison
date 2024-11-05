import LocationFactory from '../../../server/testutils/factories/location'
import { Location } from '../../../server/data/types/locationsApi'

import Page from '../../pages/page'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import DeactivateOccupiedPage from '../../pages/deactivate/occupied'
import DeactivatePermanentConfirmPage from '../../pages/deactivate/permanent/confirm'
import DeactivatePermanentDetailsPage from '../../pages/deactivate/permanent/details'
import DeactivatePermanentWarningPage from '../../pages/deactivate/permanent/warning'
import DeactivateTypePage from '../../pages/deactivate/type'
import ArchivedLocationsIndexPage from '../../pages/archivedLocations'

context('Deactivate permanent', () => {
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
    cy.task('setFeatureFlag', { permanentDeactivation: true })
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
      cy.task('stubLocationsDeactivatePermanent')
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
        DeactivatePermanentWarningPage.goTo('7e570000-0000-0000-0000-000000000001')
      })

      itDisplaysTheCellOccupiedPage()
    })

    it('can be accessed by selecting permanent when prompted after clicking the actions dropdown', () => {
      ViewLocationsShowPage.goTo(location.prisonId, location.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.actionsMenu().click()
      viewLocationsShowPage.deactivateAction().click()
      const deactivateTypePage = Page.verifyOnPage(DeactivateTypePage)
      deactivateTypePage.permRadioButton().click()
      deactivateTypePage.continueButton().click()
      Page.verifyOnPage(DeactivatePermanentWarningPage)
    })

    it('shows the correct validation error when no deactivation type is selected', () => {
      ViewLocationsShowPage.goTo(location.prisonId, location.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.actionsMenu().click()
      viewLocationsShowPage.deactivateAction().click()
      const deactivateTypePage = Page.verifyOnPage(DeactivateTypePage)
      deactivateTypePage.continueButton().click()

      cy.get('.govuk-error-summary__title').contains('There is a problem')
      cy.get('.govuk-error-summary__list').contains(
        'Select if you want to deactivate the location temporarily or permanently',
      )
      cy.get('#deactivationType-error').contains(
        'Select if you want to deactivate the location temporarily or permanently',
      )
    })

    it('remembers the deactivation type when clicking back', () => {
      ViewLocationsShowPage.goTo(location.prisonId, location.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.actionsMenu().click()
      viewLocationsShowPage.deactivateAction().click()
      let deactivateTypePage = Page.verifyOnPage(DeactivateTypePage)
      deactivateTypePage.permRadioButton().click()
      deactivateTypePage.continueButton().click()
      const warningPage = Page.verifyOnPage(DeactivatePermanentWarningPage)
      warningPage.backLink().click()
      deactivateTypePage = Page.verifyOnPage(DeactivateTypePage)
      deactivateTypePage.permRadioButton().should('be.checked')
    })

    it('has back links via the deactivation type page from the details page', () => {
      ViewLocationsShowPage.goTo(location.prisonId, location.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.actionsMenu().click()
      viewLocationsShowPage.deactivateAction().click()
      let deactivateTypePage = Page.verifyOnPage(DeactivateTypePage)
      deactivateTypePage.permRadioButton().click()
      deactivateTypePage.continueButton().click()
      const detailsPage = Page.verifyOnPage(DeactivatePermanentWarningPage)
      detailsPage.backLink().click()
      deactivateTypePage = Page.verifyOnPage(DeactivateTypePage)
      deactivateTypePage.backLink().click()
      Page.verifyOnPage(ViewLocationsShowPage)
    })

    it('can be accessed directly via the button on a temp inactive location', () => {
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
        parentLocation: { ...location, status: 'INACTIVE' },
        prisonSummary: {
          workingCapacity: 9,
          signedOperationalCapacity: 11,
          maxCapacity: 10,
        },
      })

      ViewLocationsShowPage.goTo(location.prisonId, location.id)
      Page.verifyOnPage(ViewLocationsShowPage)
      cy.get('.govuk-button:contains("Deactivate permanently")').click()
      Page.verifyOnPage(DeactivatePermanentWarningPage)
    })

    context('when the permanentDeactivation feature flag is disabled and the location is temp inactive', () => {
      beforeEach(() => {
        cy.task('setFeatureFlag', { permanentDeactivation: false })
        cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
          parentLocation: { ...location, status: 'INACTIVE' },
          prisonSummary: {
            workingCapacity: 9,
            signedOperationalCapacity: 11,
            maxCapacity: 10,
          },
        })
      })

      it('has no direct link from a temporarily deactivated location page', () => {
        ViewLocationsShowPage.goTo(location.prisonId, location.id)
        Page.verifyOnPage(ViewLocationsShowPage)
        cy.get('.govuk-button:contains("Deactivate permanently")').should('not.exist')
      })
    })

    describe('warning page', () => {
      beforeEach(() => {
        DeactivatePermanentWarningPage.goTo('7e570000-0000-0000-0000-000000000001')
      })

      it('has the correct panel text', () => {
        Page.verifyOnPage(DeactivatePermanentWarningPage)
        cy.contains('You cannot restore permanently deactivated locations.')
      })

      it('has a cancel link', () => {
        const warningPage = Page.verifyOnPage(DeactivatePermanentWarningPage)
        warningPage.cancelLink().click()

        Page.verifyOnPage(ViewLocationsShowPage)
      })

      it('continues to the details page when the button is clicked', () => {
        const warningPage = Page.verifyOnPage(DeactivatePermanentWarningPage)
        warningPage.continueButton().click()

        Page.verifyOnPage(DeactivatePermanentDetailsPage)
      })
    })

    describe('details page', () => {
      beforeEach(() => {
        DeactivatePermanentWarningPage.goTo('7e570000-0000-0000-0000-000000000001')
        const warningPage = Page.verifyOnPage(DeactivatePermanentWarningPage)
        warningPage.continueButton().click()
      })

      it('has a back link to the warning page', () => {
        const detailsPage = Page.verifyOnPage(DeactivatePermanentDetailsPage)
        detailsPage.backLink().click()

        Page.verifyOnPage(DeactivatePermanentWarningPage)
      })

      it('has a caption showing the cell description', () => {
        Page.verifyOnPage(DeactivatePermanentDetailsPage)
        cy.get('.govuk-caption-m').contains('Cell A-1-001')
      })

      it('has a cancel link', () => {
        const detailsPage = Page.verifyOnPage(DeactivatePermanentDetailsPage)
        detailsPage.cancelLink().click()

        Page.verifyOnPage(ViewLocationsShowPage)
      })

      it('shows the correct validation error when nothing is selected', () => {
        const detailsPage = Page.verifyOnPage(DeactivatePermanentDetailsPage)
        detailsPage.continueButton().click()

        cy.get('.govuk-error-summary__title').contains('There is a problem')
        cy.get('.govuk-error-summary__list').contains('Enter a reason for permanently deactivating the location')
        cy.get('#permanentDeactivationReason-error').contains(
          'Enter a reason for permanently deactivating the location',
        )
      })

      it('deactivation reason input contains an autocomplete off attribute', () => {
        cy.get('#permanentDeactivationReason').should('have.attr', 'autocomplete', 'off')
      })

      it('continues to the confirmation page when the continue button is clicked', () => {
        const detailsPage = Page.verifyOnPage(DeactivatePermanentDetailsPage)
        detailsPage.reasonInput().type('blah')
        detailsPage.continueButton().click()

        Page.verifyOnPage(DeactivatePermanentConfirmPage)
      })
    })

    describe('confirmation page', () => {
      beforeEach(() => {
        DeactivatePermanentWarningPage.goTo('7e570000-0000-0000-0000-000000000001')
        const warningPage = Page.verifyOnPage(DeactivatePermanentWarningPage)
        warningPage.continueButton().click()
        const detailsPage = Page.verifyOnPage(DeactivatePermanentDetailsPage)
        detailsPage.reasonInput().type('blah')
        detailsPage.continueButton().click()
      })

      it('has a cancel link', () => {
        const detailsPage = Page.verifyOnPage(DeactivatePermanentConfirmPage)
        detailsPage.cancelLink().click()

        Page.verifyOnPage(ViewLocationsShowPage)
      })

      it('has a back link to the details page', () => {
        const confirmationPage = Page.verifyOnPage(DeactivatePermanentConfirmPage)
        confirmationPage.backLink().click()

        Page.verifyOnPage(DeactivatePermanentDetailsPage)
      })

      it('remembers the details when back is clicked', () => {
        const confirmationPage = Page.verifyOnPage(DeactivatePermanentConfirmPage)
        confirmationPage.backLink().click()
        const detailsPage = Page.verifyOnPage(DeactivatePermanentDetailsPage)
        detailsPage.reasonInput().should('have.value', 'blah')
      })

      it('shows the correct summary list', () => {
        Page.verifyOnPage(DeactivatePermanentConfirmPage)

        cy.get('.govuk-summary-list__key').eq(0).contains('Reason')
        cy.get('.govuk-summary-list__value').eq(0).contains('blah')
      })

      it('has a change link and shows the correct summary list after change', () => {
        const confirmationPage = Page.verifyOnPage(DeactivatePermanentConfirmPage)
        confirmationPage.changeLink().click()
        const detailsPage = Page.verifyOnPage(DeactivatePermanentDetailsPage)
        detailsPage.reasonInput().clear().type('flerb')
        detailsPage.continueButton().click()
        Page.verifyOnPage(DeactivatePermanentConfirmPage)
        cy.get('.govuk-summary-list__key').eq(0).contains('Reason')
        cy.get('.govuk-summary-list__value').eq(0).contains('flerb')
      })

      it('shows the correct change summary when working cap is zero', () => {
        cy.task('stubLocations', { ...location, capacity: { maxCapacity: 2, workingCapacity: 0 } })

        Page.verifyOnPage(DeactivatePermanentConfirmPage)

        cy.get('.change-summary h2').contains('Changes to establishment capacity')
        cy.get('.change-summary p').contains(/^You are archiving 1 cell./)
        cy.get('.change-summary p').contains(/The establishment’s maximum capacity will reduce from 10 to 8.$/)
      })

      it('shows the correct change summary when working cap is > 0', () => {
        Page.verifyOnPage(DeactivatePermanentConfirmPage)

        cy.get('.change-summary h2').contains('Changes to establishment capacity')
        cy.get('.change-summary p').contains(/^You are archiving 1 cell./)
        cy.get('.change-summary p').contains(/The establishment’s working capacity will reduce from 9 to 8./)
        cy.get('.change-summary p').contains(/The establishment’s maximum capacity will reduce from 10 to 8.$/)
      })

      context('With the VIEW_INTERNAL_LOCATION role', () => {
        let locations: Location[]

        beforeEach(() => {
          locations = [
            LocationFactory.build({
              id: '7e570000-0000-000a-0001-000000000001',
              pathHierarchy: 'A-1-001',
              localName: undefined,
              code: '001',
              inactiveCells: 1,
              capacity: { maxCapacity: 3, workingCapacity: 1 },
              status: 'INACTIVE',
              deactivatedReason: 'TEST1',
              proposedReactivationDate: new Date(2023, 3, 14).toISOString(),
              planetFmReference: 'FM-1234321',
            }),
            LocationFactory.build({
              id: '7e570000-0000-000a-0001-000000000002',
              pathHierarchy: 'A-1-002',
              localName: undefined,
              code: '002',
              inactiveCells: 1,
              capacity: { maxCapacity: 3, workingCapacity: 1 },
              status: 'INACTIVE',
              deactivatedReason: 'TEST1',
              proposedReactivationDate: new Date(2024, 2, 1).toISOString(),
              planetFmReference: undefined,
            }),
            LocationFactory.build({
              id: '7e570000-0000-000b-0001-000000000001',
              pathHierarchy: 'B-1-001',
              localName: undefined,
              code: '001',
              inactiveCells: 1,
              capacity: { maxCapacity: 3, workingCapacity: 1 },
              status: 'INACTIVE',
              deactivatedReason: 'TEST1',
              proposedReactivationDate: new Date(2024, 1, 3).toISOString(),
              planetFmReference: 'FM-1133',
            }),
          ]
          cy.task('stubLocationsPrisonArchivedLocations', locations)
        })

        it('shows the success banner on completion', () => {
          const confirmationPage = Page.verifyOnPage(DeactivatePermanentConfirmPage)
          confirmationPage.confirmButton().click()
          Page.verifyOnPage(ArchivedLocationsIndexPage)
          cy.get('#govuk-notification-banner-title').contains('Success')
          cy.get('.govuk-notification-banner__content h3').contains('Location archived')
          cy.get('.govuk-notification-banner__content p').contains('You have permanently deactivated cell A-1-001.')
        })
      })

      context('when the cell becomes occupied during the process', () => {
        beforeEach(() => {
          cy.task('stubLocationsDeactivatePermanentOccupied')

          const confirmationPage = Page.verifyOnPage(DeactivatePermanentConfirmPage)
          confirmationPage.confirmButton().click()
        })

        itDisplaysTheCellOccupiedPage()
      })
    })
  })
})
