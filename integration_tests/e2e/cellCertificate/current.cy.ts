import setupStubs from './setupStubs'
import Page from '../../pages/page'
import CellCertificateCurrentPage from '../../pages/cellCertificate/current'
import LocationsApiStubber from '../../mockApis/locationsApi'
import CellCertificateFactory from '../../../server/testutils/factories/cellCertificate'
import testGovukTable from '../../support/testGovukTable'

context('Cell Certificate - Current', () => {
  let page: CellCertificateCurrentPage

  context('With default access', () => {
    beforeEach(() => {
      setupStubs([])
      cy.signIn()
    })

    context('When there is a current cell certificate', () => {
      beforeEach(() => {
        LocationsApiStubber.stub.stubLocationsCellCertificatesPrisonCurrent(CellCertificateFactory.build())

        CellCertificateCurrentPage.goTo()
        page = Page.verifyOnPage(CellCertificateCurrentPage)
      })

      it('Correctly displays all of the cell certificate information', () => {
        page.changeRequestsLink().should('contain', 'Change requests (2)')

        page.approvalText().should('contain', 'Last change approved by john smith on Thursday 5 June 2025 at 10:35.')
        page.viewHistoryLink().should('exist')
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

    context('When there is not a current cell certificate', () => {
      beforeEach(() => {
        LocationsApiStubber.stub.stubLocationsCellCertificatesPrisonCurrent404()
        CellCertificateCurrentPage.goTo()
        page = Page.verifyOnPage(CellCertificateCurrentPage)
      })

      it('States that there is no current cell certificate', () => {
        cy.get('p').should('contain', 'This prison does not have a cell certificate')
      })
    })
  })
})
