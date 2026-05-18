import Page from '../../../../../pages/page'
import ViewLocationsShowPage from '../../../../../pages/viewLocations/show'
import { setupStubs, location } from './setupStubs'
import CertChangeDisclaimerPage from '../../../../../pages/commonTransactions/certChangeDisclaimer'

context('Certification Deactivation - Cell - Temporary to certified - Init', () => {
  context('without the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs('RESI__CERT_VIEWER')

      cy.signIn()
    })

    it('does not show the action in the inactive banner on the show location page', () => {
      ViewLocationsShowPage.goTo(location.prisonId, location.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.inactiveBannerDecreaseCertifiedWorkingCapacityButton().should('not.exist')
    })
  })

  context('with the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs('MANAGE_RES_LOCATIONS_OP_CAP')

      cy.signIn()
    })

    it('shows the action in the inactive banner and navigates to cert change disclaimer', () => {
      ViewLocationsShowPage.goTo(location.prisonId, location.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.inactiveBannerDecreaseCertifiedWorkingCapacityButton().click()

      Page.verifyOnPage(CertChangeDisclaimerPage, 'Decreasing certified working capacity')
    })
  })
})

context('with only the MANAGE_RESIDENTIAL_LOCATIONS role', () => {
  beforeEach(() => {
    setupStubs('MANAGE_RESIDENTIAL_LOCATIONS')

    cy.signIn()
  })

  it('navigates back to the location show page', () => {
    cy.visit(`/location/${location.id}/deactivate`)
    Page.verifyOnPage(ViewLocationsShowPage)
  })
})
