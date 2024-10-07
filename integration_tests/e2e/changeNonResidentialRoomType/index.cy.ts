import AuthSignInPage from '../../pages/authSignIn'
import Page from '../../pages/page'
import LocationFactory from '../../../server/testutils/factories/location'
import NonResidentialRoomPage from '../../pages/nonResidentialRoom'
import NonResidentialRoomPageSuccess from '../../pages/nonResidentialRoomSuccess'
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
    const locationOther = LocationFactory.build({
      isResidential: false,
      leafLevel: true,
      localName: 'A-1-001',
      status: 'NON_RESIDENTIAL',
      convertedCellType: 'OTHER',
      otherConvertedCellType: 'Some other type',
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
      cy.task('stubLocationsUpdateNonResCell')
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

      nonResidentialRoomTypeChangePage.continueButton().click()
      Page.verifyOnPage(NonResidentialRoomPageSuccess)
      cy.get('#govuk-notification-banner-title').contains('Success')
      cy.get('.govuk-notification-banner__content h3').contains('Non-residential room type changed')
      cy.get('.govuk-notification-banner__content p').contains('You have changed non residential type for A-1-001')
    })

    it('User can select other reason type', () => {
      NonResidentialRoomPage.goTo(location.prisonId, location.id)
      const nonResidentialRoomPage = Page.verifyOnPage(NonResidentialRoomPage)
      nonResidentialRoomPage.changeLink().click()

      const nonResidentialRoomTypeChangePage = Page.verifyOnPage(NonResidentialRoomTypeChangePage)
      nonResidentialRoomTypeChangePage.cellTypeRadioItem('OTHER').click()
      nonResidentialRoomTypeChangePage.otherFreeText().should('exist')
      nonResidentialRoomTypeChangePage.otherFreeText().type('Some other type')

      cy.task('stubLocationsLocationsResidentialSummaryForLocation', { parentLocation: locationOther })
      nonResidentialRoomTypeChangePage.continueButton().click()
      Page.verifyOnPage(NonResidentialRoomPageSuccess)
      cy.get('#govuk-notification-banner-title').contains('Success')
      cy.get('.govuk-summary-list__row').contains('Other - Some other type ')
    })
  })
})
