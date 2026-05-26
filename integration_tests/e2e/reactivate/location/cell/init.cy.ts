import Page from '../../../../pages/page'
import ViewLocationsShowPage from '../../../../pages/viewLocations/show'
import AuthSignInPage from '../../../../pages/authSignIn'
import { setupStubs, location } from './setupStubs'
import CheckCapacityPage from '../../../../pages/reactivate/location/checkCapacity'
import NoCertChangeConfirmPage from '../../../../pages/reactivate/location/noCertChangeConfirm'

context('Certification Reactivation - Cell - Init', () => {
  context('with a read-only role', () => {
    beforeEach(() => {
      setupStubs('RESI__CERT_VIEWER')

      cy.signIn()
    })

    it('does not show the action in the menu on the show location page', () => {
      ViewLocationsShowPage.goTo(location.prisonId, location.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.inactiveBannerActivateCellButton().should('not.exist')
    })

    it('redirects user to sign in page when visited directly', () => {
      cy.visit(`/reactivate/location/${location.id}`)
      Page.verifyOnPage(AuthSignInPage)
    })
  })

  context('with the MANAGE_RESIDENTIAL_LOCATIONS role', () => {
    context('for a temp inactive location', () => {
      beforeEach(() => {
        setupStubs('MANAGE_RESIDENTIAL_LOCATIONS', false)

        cy.signIn()
      })

      it('displays the confirmation page', () => {
        cy.visit(`/reactivate/location/${location.id}/`)

        Page.verifyOnPage(NoCertChangeConfirmPage)
      })
    })

    context('for an inactive location with reduced capacity on the certificate', () => {
      beforeEach(() => {
        setupStubs('MANAGE_RESIDENTIAL_LOCATIONS', true)

        cy.signIn()
      })

      it('does not show the action in the menu on the show location page', () => {
        ViewLocationsShowPage.goTo(location.prisonId, location.id)
        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.inactiveBannerActivateCellButton().should('not.exist')
      })
    })
  })

  context('with the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs('MANAGE_RES_LOCATIONS_OP_CAP')

      cy.signIn()
    })

    it('displays the check-capacity page', () => {
      cy.visit(`/reactivate/location/${location.id}/`)

      Page.verifyOnPage(CheckCapacityPage)
    })
  })
})
