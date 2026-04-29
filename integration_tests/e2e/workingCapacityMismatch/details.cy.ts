import { cell, setupStubs } from './setupStubs'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import Page from '../../pages/page'
import AuthSignInPage from '../../pages/authSignIn'
import goToDetails from './goToDetails'
import CertChangeDisclaimerPage from '../../pages/commonTransactions/certChangeDisclaimer'
import WorkingCapacityMismatchConfirm from '../../pages/workingCapacityMismatch/confirm'

context('Working Capacity Mismatch - Details', () => {
  context('without the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs('RESI__CERT_VIEWER')

      cy.signIn()
    })

    it('does not show the working capacity mismatch banner on the show location page', () => {
      ViewLocationsShowPage.goTo(cell.prisonId, cell.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.workingCapacityMismatchBanner().should('not.exist')
    })

    it('redirects user to sign in page when visited directly', () => {
      cy.visit(`/location/${cell.id}/working-capacity-mismatch`)
      Page.verifyOnPage(AuthSignInPage)
    })
  })

  context('with the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs('MANAGE_RES_LOCATIONS_OP_CAP')
    })

    it('shows the working capacity mismatch banner on the show location page', () => {
      cy.signIn()

      ViewLocationsShowPage.goTo(cell.prisonId, cell.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.workingCapacityMismatchBannerButton().should('exist')
    })

    it('shows an error when no radio button is checked', () => {
      goToDetails().submit({})

      Page.checkForError('certifiedChange', 'Choose how to fix this difference')
    })

    it('shows the correct values and navigates to cert change disclaimer when updating cert', () => {
      const page = goToDetails()

      page.testTable([
        ['Working capacity', '0'],
        ['Certified working capacity', '1'],
      ])

      page.submit({ certified: true })
      Page.verifyOnPage(CertChangeDisclaimerPage, 'Changing the cell’s capacity')
    })

    it('navigates to confirm when not updating cert', () => {
      goToDetails().submit({ certified: false })

      Page.verifyOnPage(WorkingCapacityMismatchConfirm)
    })

    it('has a back link to show location', () => {
      goToDetails().backLink().click()

      Page.verifyOnPage(ViewLocationsShowPage)
    })

    it('has a cancel link to show location', () => {
      goToDetails().cancelLink().click()

      Page.verifyOnPage(ViewLocationsShowPage)
    })
  })
})
