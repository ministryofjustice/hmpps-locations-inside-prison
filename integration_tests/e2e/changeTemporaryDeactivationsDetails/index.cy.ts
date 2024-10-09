import LocationFactory from '../../../server/testutils/factories/location'
import Page from '../../pages/page'
import InactiveCellsIndexPage from '../../pages/inactiveCells/index'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import ChangeTemporaryDeactivationDetailsPage from '../../pages/changeTemporaryDeactivationDetails/details'
import AuthSignInPage from '../../pages/authSignIn'
import IndexPage from '../../pages/index'
import { Location } from '../../../server/data/types/locationsApi'

context('Change temporary deactivations details', () => {
  context('Without the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', { roles: [] })
    })

    it('Unauthenticated user directed to auth', () => {
      cy.visit('/')
      Page.verifyOnPage(AuthSignInPage)
    })

    it('Unauthenticated user navigating to sign in page directed to auth', () => {
      cy.visit('/sign-in')
      Page.verifyOnPage(AuthSignInPage)
    })
  })

  context('With the VIEW_INTERNAL_LOCATION role', () => {
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
    })
    let locations: Location[]

    context('When location id is provided', () => {
      beforeEach(() => {
        locations = [
          LocationFactory.build({
            id: '74a5ea0a-5457-4028-b5eb-0a32daf25546',
            prisonId: 'TST',
            code: '005',
            pathHierarchy: 'A-1-001',
            locationType: 'CELL',
            permanentlyInactive: false,
            capacity: {
              maxCapacity: 2,
              workingCapacity: 0,
            },
            oldWorkingCapacity: 0,
            certification: {
              certified: true,
              capacityOfCertifiedCell: 2,
            },
            accommodationTypes: ['NORMAL_ACCOMMODATION'],
            specialistCellTypes: [],
            usedFor: ['STANDARD_ACCOMMODATION'],
            status: 'INACTIVE',
            active: false,
            deactivatedByParent: false,
            deactivatedDate: '2024-10-03T09:18:58',
            deactivatedReason: 'OTHER',
            deactivationReasonDescription: 'Broken door lock',
            deactivatedBy: 'ITAG_USER',
            proposedReactivationDate: '2024-11-22',
            planetFmReference: '123005',
            topLevelId: '5d597e0b-e350-40bc-bc05-2af159ffa15b',
            level: 3,
            leafLevel: true,
            parentId: 'e53902e1-eab8-4eae-b30f-f6f835f06956',
            lastModifiedBy: 'ITAG_USER',
            lastModifiedDate: '2024-10-03T09:18:58',
            key: 'LEI-A-1-005',
            isResidential: true,
          }),
        ]
        cy.task('stubLocationsPrisonInactiveCells', locations)

        cy.signIn()
        const indexPage = Page.verifyOnPage(IndexPage)
        indexPage.cards.inactiveCells().click()
        const inactiveCellsIndexPage = Page.verifyOnPage(InactiveCellsIndexPage)

        cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
          parentLocation: locations[0],
          prisonSummary: {
            workingCapacity: 9,
            signedOperationalCapacity: 11,
            maxCapacity: 10,
          },
        })

        inactiveCellsIndexPage.getFirstRow().click()

        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)

        cy.task('stubLocationsChangeTemporaryDeactivationDetails')
        cy.task('stubPrisonerLocationsId', [])
        cy.task('stubLocations', locations[0])

        viewLocationsShowPage.inactiveBannerChangeLink().click()
      })

      describe('details page', () => {
        it('can access the details page', () => {
          Page.verifyOnPage(ChangeTemporaryDeactivationDetailsPage)
        })

        it('has an update button which links to the view location page', () => {
          const detailsPage = Page.verifyOnPage(ChangeTemporaryDeactivationDetailsPage)
          detailsPage.updateButton().click()

          Page.verifyOnPage(ViewLocationsShowPage)
        })

        it('has a back link to the view location page', () => {
          const detailsPage = Page.verifyOnPage(ChangeTemporaryDeactivationDetailsPage)
          detailsPage.backLink().click()

          Page.verifyOnPage(ViewLocationsShowPage)
        })

        it('has a cancel link to the view location page', () => {
          const detailsPage = Page.verifyOnPage(ChangeTemporaryDeactivationDetailsPage)
          detailsPage.cancelLink().click()

          Page.verifyOnPage(ViewLocationsShowPage)
        })

        it('shows the correct radio buttons', () => {
          const detailsPage = Page.verifyOnPage(ChangeTemporaryDeactivationDetailsPage)

          detailsPage.reasonRadioLabels().eq(0).contains('Test type 1')
          detailsPage.reasonRadioLabels().eq(1).contains('Test type 2')
          detailsPage.reasonRadioLabels().eq(2).contains('Other')
        })
      })

      describe('view location page', () => {
        it('does not display the sucess notification banner with the expected elements when a change is made in the details page', () => {
          Page.verifyOnPage(ChangeTemporaryDeactivationDetailsPage)
          cy.get('button:contains("Update deactivation details")').click()
          Page.verifyOnPage(ViewLocationsShowPage)

          cy.get(
            ':nth-child(5) > .govuk-grid-row > .govuk-grid-column-three-quarters > .govuk-notification-banner',
          ).should('not.exist')
        })

        it('displays the sucess notification banner with the expected elements when a change is made in the details page', () => {
          const detailsPage = Page.verifyOnPage(ChangeTemporaryDeactivationDetailsPage)
          detailsPage.reasonRadioItem('OTHER').click()

          cy.get('#deactivationReasonOther').clear()
          cy.get('#deactivationReasonOther').type('A reason')
          cy.get('button:contains("Update deactivation details")').click()

          Page.verifyOnPage(ViewLocationsShowPage)

          cy.get(
            ':nth-child(5) > .govuk-grid-row > .govuk-grid-column-three-quarters > .govuk-notification-banner',
          ).contains('Success')
          cy.get(
            ':nth-child(5) > .govuk-grid-row > .govuk-grid-column-three-quarters > .govuk-notification-banner',
          ).contains('Deactivation details updated')
          cy.get(
            ':nth-child(5) > .govuk-grid-row > .govuk-grid-column-three-quarters > .govuk-notification-banner',
          ).contains('You have updated the deactivation details for this location.')
          cy.get('.govuk-button').contains('Activate cell')
        })
      })
    })
  })
})
