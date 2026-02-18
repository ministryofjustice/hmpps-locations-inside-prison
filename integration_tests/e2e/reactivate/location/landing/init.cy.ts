import Page from '../../../../pages/page'
import ViewLocationsShowPage from '../../../../pages/viewLocations/show'
import AuthSignInPage from '../../../../pages/authSignIn'
import { setupStubs, location } from './setupStubs'
import CertChangeDisclaimerPage from '../../../../pages/commonTransactions/certChangeDisclaimer'

context('Certification Reactivation - Landing - Init', () => {
  context('without the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs('RESI__CERT_VIEWER')

      cy.signIn()
    })

    it('does not show the action in the menu on the show location page', () => {
      ViewLocationsShowPage.goTo(location.prisonId, location.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.inactiveBannerActivateEntireButton().should('not.exist')
    })

    it('redirects user to sign in page when visited directly', () => {
      cy.visit(`/reactivate/location/${location.id}`)
      Page.verifyOnPage(AuthSignInPage)
    })
  })

  context('with the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs('MANAGE_RES_LOCATIONS_OP_CAP')

      cy.signIn()
    })

    it('displays the cert-change-disclaimer page', () => {
      cy.visit(`/reactivate/location/${location.id}/`)
      // eslint-disable-next-line no-new
      new CertChangeDisclaimerPage('Landing activation')
    })
  })
})
