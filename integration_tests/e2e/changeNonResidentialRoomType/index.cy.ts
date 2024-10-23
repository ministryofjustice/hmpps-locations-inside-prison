import AuthSignInPage from '../../pages/authSignIn'
import Page from '../../pages/page'
import LocationFactory from '../../../server/testutils/factories/location'
import NonResidentialRoomPage from '../../pages/nonResidentialRoom'
import NonResidentialRoomTypeChangePage from '../../pages/nonResidentialRoom/setNonResidentialChangeType'

context('Change non-residential rooms', () => {
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
      convertedCellType: 'OFFICE',
      otherConvertedCellType: '',
    })
    const locationOther = LocationFactory.build({
      isResidential: false,
      leafLevel: true,
      localName: 'A-1-001',
      status: 'NON_RESIDENTIAL',
      convertedCellType: 'OTHER',
      otherConvertedCellType: 'Some other type',
    })
    const locationChanged = LocationFactory.build({
      isResidential: false,
      leafLevel: true,
      localName: 'A-1-001',
      status: 'NON_RESIDENTIAL',
      convertedCellType: 'KITCHEN_SERVERY',
      otherConvertedCellType: '',
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
      NonResidentialRoomPage.goTo(location.prisonId, location.id)
    })

    it('Enables navigation to the Change non-residential room type, page', () => {
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

      nonResidentialRoomTypeChangePage.cellTypeRadioItem('OFFICE').should('be.checked')
      nonResidentialRoomTypeChangePage.cellTypeRadioItem('KITCHEN_SERVERY').should('not.be.checked')
      nonResidentialRoomTypeChangePage.cellTypeRadioItem('KITCHEN_SERVERY').click()
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', { parentLocation: locationChanged })

      nonResidentialRoomTypeChangePage.continueButton().click()
      Page.verifyOnPage(NonResidentialRoomPage)
      cy.get('#govuk-notification-banner-title').contains('Success')
      cy.get('.govuk-notification-banner__content h3').contains('Non-residential room type changed')
      cy.get('.govuk-notification-banner__content p').contains('You have changed the room type for A-1-001.')
      cy.get('.govuk-heading-l').contains('A-1-001')
      nonResidentialRoomPage.changeLink().should('exist')
      cy.get('.govuk-summary-list__value').contains('Kitchen / Servery')
    })

    it('User can select other reason type', () => {
      const nonResidentialRoomPage = Page.verifyOnPage(NonResidentialRoomPage)
      nonResidentialRoomPage.changeLink().click()

      const nonResidentialRoomTypeChangePage = Page.verifyOnPage(NonResidentialRoomTypeChangePage)
      nonResidentialRoomTypeChangePage.cellTypeRadioItem('OTHER').click()
      nonResidentialRoomTypeChangePage.otherFreeText().should('exist')
      nonResidentialRoomTypeChangePage.otherFreeText().type('Some other type')

      cy.task('stubLocationsLocationsResidentialSummaryForLocation', { parentLocation: locationOther })
      nonResidentialRoomTypeChangePage.continueButton().click()
      Page.verifyOnPage(NonResidentialRoomPage)
      cy.get('#govuk-notification-banner-title').contains('Success')
      cy.get('.govuk-summary-list__row').contains('Other - Some other type ')
    })

    it('User selects same change type then Success Banner is not displayed', () => {
      const nonResidentialRoomPage = Page.verifyOnPage(NonResidentialRoomPage)

      cy.get('.govuk-heading-l').contains('A-1-001')
      nonResidentialRoomPage.changeLink().should('exist')
      cy.get('.govuk-summary-list__value').contains('Office')
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
      nonResidentialRoomTypeChangePage.cellTypeRadioItem('OFFICE').should('be.checked')
      nonResidentialRoomTypeChangePage.cellTypeRadioItem('OFFICE').click()

      // return to the Room view without Success banner
      nonResidentialRoomTypeChangePage.continueButton().click()
      Page.verifyOnPage(NonResidentialRoomPage)
      cy.get('.govuk-heading-l').contains('A-1-001')
      nonResidentialRoomPage.changeLink().should('exist')
      cy.get('.govuk-summary-list__value').contains('Office')
    })

    it('Enables navigation to update other description then Success details updated Banner for non-residential room type', () => {
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', { parentLocation: locationOther })
      cy.task('stubLocations', locationOther)
      NonResidentialRoomPage.goTo(location.prisonId, location.id)
      const nonResidentialRoomPage = Page.verifyOnPage(NonResidentialRoomPage)

      cy.get('.govuk-heading-l').contains('A-1-001')
      nonResidentialRoomPage.changeLink().should('exist').click()

      const nonResidentialRoomTypeChangePage = Page.verifyOnPage(NonResidentialRoomTypeChangePage)
      Page.verifyOnPage(NonResidentialRoomPage)

      nonResidentialRoomTypeChangePage.cellTypeRadioItem('OTHER').should('be.checked')
      nonResidentialRoomTypeChangePage.cellTypeRadioItem('KITCHEN_SERVERY').should('not.be.checked')
      nonResidentialRoomTypeChangePage.cellTypeRadioItem('OTHER').click()
      nonResidentialRoomTypeChangePage.otherFreeText().should('exist').clear().type('Some other updated')
      nonResidentialRoomTypeChangePage.continueButton().click()

      cy.get('#govuk-notification-banner-title').contains('Success')
      cy.get('.govuk-notification-banner__content h3').contains('Non-residential room details updated')
      cy.get('.govuk-notification-banner__content p').contains('You have changed the room description for A-1-001.')
      cy.get('.govuk-heading-l').contains('A-1-001')
      cy.get('.govuk-summary-list__value').contains('Other')
    })
  })
})
