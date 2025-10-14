import setupStubs from './setupStubs'
import Page from '../../pages/page'
import LocationsApiStubber from '../../mockApis/locationsApi'
import CellCertificateFactory from '../../../server/testutils/factories/cellCertificate'
import testGovukTable from '../../support/testGovukTable'
import CellCertificateShowPage from '../../pages/cellCertificate/show'

context('Cell Certificate - Show', () => {
  let page: CellCertificateShowPage

  context('With VIEW_INTERNAL_LOCATION role', () => {
    beforeEach(() => {
      setupStubs(['VIEW_INTERNAL_LOCATION'])
      cy.signIn()
    })

    beforeEach(() => {
      LocationsApiStubber.stub.stubLocationsCellCertificates(CellCertificateFactory.build())

      CellCertificateShowPage.goTo('cellCertificateId1')
      page = Page.verifyOnPage(CellCertificateShowPage)
    })

    it('Correctly displays all of the cell certificate information', () => {
      cy.get('h1').should('contain', 'Previous cell certificate (5 June 2025)')

      page.approvalText().should('contain', 'Approved by john smith on Thursday 5 June 2025 at 10:35.')
      page.signedOpCap().should('contain', '175')

      page.cnaCard().should('contain', '150')
      page.workingCapacityCard().should('contain', '100')
      page.maxCapacityCard().should('contain', '200')

      testGovukTable('wing-usage-table', [
        ['A', ['Normal accommodation', 'Healthcare inpatients'], ['Close Supervision Centre (CSC)', 'Test type']],
      ])

      testGovukTable('cell-schedule-table', [
        ['A-wing', '-', '20', '10', '30', '-', '-'],
        ['A-1-001', 'A1-01', '2', '1', '3', 'Normal accommodation', 'Yes'],
        ['A-1-002', 'A1-02', '2', '1', '3', 'Normal accommodation', 'Yes'],
        ['A-1-003', 'A1-03', '2', '1', '3', 'Normal accommodation', 'Yes'],
        ['A-1-004', 'A1-04', '2', '1', '3', 'Normal accommodation', 'Yes'],
        ['A-1-005', 'A1-05', '2', '1', '3', 'Normal accommodation', 'Yes'],
        ['A-2-001', 'A2-01', '2', '1', '3', 'Normal accommodation', 'Yes'],
        ['A-2-002', 'A2-02', '2', '1', '3', 'Normal accommodation', 'Yes'],
        ['A-2-003', 'A2-03', '2', '1', '3', 'Normal accommodation', 'Yes'],
        ['A-2-004', 'A2-04', '2', '1', '3', 'Normal accommodation', 'Yes'],
        ['A-2-005', 'A2-05', '2', '1', '3', 'Normal accommodation', 'Yes'],
      ])
    })
  })
})
