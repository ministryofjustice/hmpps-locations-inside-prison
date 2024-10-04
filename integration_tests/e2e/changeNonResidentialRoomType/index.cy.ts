import AuthSignInPage from '../../pages/authSignIn'
import Page from '../../pages/page'
import LocationFactory from '../../../server/testutils/factories/location'
import NonResidentialRoomPage from '../../pages/nonResidentialRoom'
import NonResidentialRoomTypeChangePage from '../../pages/nonResidentialRoomTypeChange'

context('View non-residential rooms', () => {
  context('When user does not have the MANAGE_RESIDENTIAL_LOCATIONS role', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', { roles: [] })
    })

    it('Unauthenticated user directed to auth', () => {
      cy.visit(`/view-and-update-locations/TST/123456`)
      Page.verifyOnPage(AuthSignInPage)
    })
  })

  context('When user does have the MANAGE_RESIDENTIAL_LOCATIONS role', () => {
    const location = LocationFactory.build({
      isResidential: false,
      leafLevel: true,
      localName: 'A-1-001',
      status: 'NON_RESIDENTIAL',
    })

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
      cy.task('stubPrisonerLocationsId', [])
      cy.task('stubSignIn', { roles: ['MANAGE_RESIDENTIAL_LOCATIONS'] })
      cy.signIn()
    })

    it('Enables navigation to the Change non-residential room type, page', () => {
      NonResidentialRoomPage.goTo(location.prisonId, location.id)
      const nonResidentialRoomPage = Page.verifyOnPage(NonResidentialRoomPage)

      cy.get('.govuk-heading-l').contains('A-1-001')

      nonResidentialRoomPage.changeLink().should('exist')

      nonResidentialRoomPage.changeLink().click()

      // check cancel link
      const nonResidentialRoomTypeChangePage = Page.verifyOnPage(NonResidentialRoomTypeChangePage)
      nonResidentialRoomTypeChangePage.cancelLink().click()
      Page.verifyOnPage(NonResidentialRoomPage)

      // check back link
      nonResidentialRoomPage.changeLink().click()
      nonResidentialRoomTypeChangePage.backLink().click()
      Page.verifyOnPage(NonResidentialRoomPage)

      // go forward
      nonResidentialRoomPage.changeLink().click()
      Page.verifyOnPage(NonResidentialRoomPage)
      nonResidentialRoomTypeChangePage.cellTypeRadioItem('OFFICE').click()

      // nonResidentialRoomTypeChangePage.continueButton().click()
      // need to verify we are on next success page for 'non-residential room type changed'
    })
  })
})
