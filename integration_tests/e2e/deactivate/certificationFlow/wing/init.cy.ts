import Page from '../../../../pages/page'
import ViewLocationsShowPage from '../../../../pages/viewLocations/show'
import PermissionDeniedPage from '../../../../pages/permissionDenied'
import { setupStubs, location } from './setupStubs'
import CertChangeDisclaimerPage from '../../../../pages/commonTransactions/certChangeDisclaimer'
import paths from '../../../../../server/utils/paths'

context('Certification Deactivation - Wing - Init', () => {
  context('without the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs('RESI__CERT_VIEWER')

      cy.signIn()
    })

    it('does not show the action in the menu on the show location page', () => {
      ViewLocationsShowPage.goTo(location.prisonId, location.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.deactivateAction().should('not.exist')
    })

    it('shows a permission error when visited directly', () => {
      PermissionDeniedPage.goTo(paths.location.deactivate(location))
      Page.verifyOnPage(PermissionDeniedPage)
    })
  })

  context('with the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs('MANAGE_RES_LOCATIONS_OP_CAP')

      cy.signIn()
    })

    context('when no cells are occupied', () => {
      it('displays the cert-change-disclaimer page', () => {
        cy.visit(paths.location.deactivate(location))
        Page.verifyOnPage(CertChangeDisclaimerPage, 'Deactivating a wing')
      })
    })
  })
})
