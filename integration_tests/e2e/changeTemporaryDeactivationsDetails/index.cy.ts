import LocationFactory from '../../../server/testutils/factories/location'
import Page from '../../pages/page'
import InactiveCellsIndexPage from '../../pages/inactiveCells/index'
// import ChangeTemporaryDeactivationDetailsPage from '../../pages/changeTemporaryDeactivationDetails/details'
import AuthSignInPage from '../../pages/authSignIn'
import IndexPage from '../../pages/index'

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
    })
    // let locations: Location[]

    context('When location id is provided', () => {
      beforeEach(() => {
        // const locations = [LocationFactory.build({
        //   id: '7e570000-0000-000b-0001-000000000001',
        //   pathHierarchy: 'B-1-001',
        //   localName: null,
        //   code: '001',
        //   inactiveCells: 1,
        //   capacity: { maxCapacity: 3, workingCapacity: 1 },
        //   status: 'INACTIVE',
        //   deactivatedReason: 'TEST1',
        //   proposedReactivationDate: new Date(2024, 1, 3).toISOString(),
        //   planetFmReference: 'FM-1133',
        // })]
        // cy.task('stubLocationsChangeTemporaryDeactivationDetails', locations)
      })

      it('Correctly presents the API data for a location', () => {
        cy.signIn()
        Page.verifyOnPage(IndexPage)

        cy.visit('/inactive-cells/TST/8ba666c5-1425-4509-a777-63343956da9a')
        // const inactiveCellsIndexPage = Page.verifyOnPage(InactiveCellsIndexPage)

        // cy.visit('/location/8ba666c5-1425-4509-a777-63343956da9a/change-temporary-deactivation-details/details')
        // const inactiveCellsIndexPage = Page.verifyOnPage(InactiveCellsIndexPage)
      })
    })
  })
})
