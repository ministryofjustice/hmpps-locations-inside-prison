import Page from '../../../../pages/page'
import ViewLocationsShowPage from '../../../../pages/viewLocations/show'
import CellCertChangePage from '../../../../pages/deactivate/cell-cert-change'
import CertChangeDisclaimerPage from '../../../../pages/commonTransactions/certChangeDisclaimer'
import DeactivateTemporaryDetailsPage from '../../../../pages/deactivate/temporary/details'
import goToCellCertChange from './goToCellCertChange'
import { setupStubs } from './setupStubs'

context('Certification Deactivation - Cell - Cell cert change', () => {
  let page: CellCertChangePage

  beforeEach(() => {
    setupStubs('MANAGE_RES_LOCATIONS_OP_CAP')

    page = goToCellCertChange()
  })

  it('shows the correct content', () => {
    cy.get('.govuk-caption-m').contains('Cell A-1-001')
    cy.get('p').contains(
      'You should decrease the certified working capacity if a location will be unavailable long term or if it will ' +
        'result in a significant reduction to capacity.',
    )
  })

  it('has a cancel link', () => {
    page.cancelLink().click()

    Page.verifyOnPage(ViewLocationsShowPage)
  })

  it('displays the correct error when no box is ticked', () => {
    page.submit({})

    Page.checkForError(
      'reduceWorkingCapacity',
      'Select yes if you want to reduce the cell’s certified working capacity to 0',
    )
  })

  it('proceeds to cert change disclaimer if yes is ticked', () => {
    page.submit({ certChange: true })

    // eslint-disable-next-line no-new
    new CertChangeDisclaimerPage('Decreasing certified working capacity')
  })

  it('proceeds to details if no is ticked', () => {
    page.submit({ certChange: false })

    Page.verifyOnPage(DeactivateTemporaryDetailsPage)
  })
})
