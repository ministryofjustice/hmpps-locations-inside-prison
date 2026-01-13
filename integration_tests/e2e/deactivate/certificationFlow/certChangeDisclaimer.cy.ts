import LocationFactory from '../../../../server/testutils/factories/location'
import Page from '../../../pages/page'
import ViewLocationsShowPage from '../../../pages/viewLocations/show'
import setupStubs from './setupStubs'
import CellCertChangePage from '../../../pages/deactivate/cell-cert-change'
import CertChangeDisclaimerPage from '../../../pages/commonTransactions/certChangeDisclaimer'

context('Certification Deactivation - Cell - Cert change disclaimer', () => {
  const location = LocationFactory.build({
    accommodationTypes: ['NORMAL_ACCOMMODATION'],
    capacity: {
      maxCapacity: 2,
      workingCapacity: 1,
    },
    leafLevel: true,
    localName: null,
    specialistCellTypes: ['ACCESSIBLE_CELL', 'CONSTANT_SUPERVISION'],
  })
  let page: CertChangeDisclaimerPage

  beforeEach(() => {
    setupStubs('MANAGE_RES_LOCATIONS_OP_CAP', location)

    cy.signIn()
    cy.visit(`/location/${location.id}/deactivate`)
    Page.verifyOnPage(CellCertChangePage).submit({ certChange: true })
    page = new CertChangeDisclaimerPage('Decreasing certified working capacity')
  })

  it('has a cancel link', () => {
    page.cancelLink().click()

    Page.verifyOnPage(ViewLocationsShowPage)
  })

  it('has a back link', () => {
    page.backLink().click()

    Page.verifyOnPage(CellCertChangePage)
  })

  // TODO: add check for next step
})
