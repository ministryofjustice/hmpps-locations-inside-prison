import setupStubs from '../setupStubs'
import Page from '../../../pages/page'
import testGovukTable from '../../../support/testGovukTable'
import CellCertificateChangeRequestsShowPage from '../../../pages/cellCertificate/changeRequests/show'
import testGovukSummaryList from '../../../support/testGovukSummaryList'
import LocationsApiStubber from '../../../mockApis/locationsApi'
import CertificationApprovalRequestFactory from '../../../../server/testutils/factories/certificationApprovalRequest'

context('Cell Certificate - Change Requests - Show', () => {
  context('With default access', () => {
    beforeEach(() => {
      setupStubs([])
      cy.signIn()
    })

    context('When the approvalType is DRAFT', () => {
      beforeEach(() => {
        LocationsApiStubber.stub.stubLocationsCertificationRequestApprovals(CertificationApprovalRequestFactory.build())

        CellCertificateChangeRequestsShowPage.goTo('id1')
        Page.verifyOnPage(CellCertificateChangeRequestsShowPage)
      })

      it('Correctly displays the change request info', () => {
        cy.get('h1').should('contain', 'Add new locations request details')

        testGovukSummaryList('overview-list', [
          ['Location', 'A'],
          ['Change type', 'Add new locations to certificate'],
          ['Submitted on', '3 October 2024'],
          ['Submitted by', 'john smith'],
          ['Status', 'Awaiting approval'],
        ])

        testGovukTable('wing-table', [
          ['A', ['Normal accommodation', 'Healthcare inpatients'], ['Close Supervision Centre (CSC)', 'Test type']],
        ])

        testGovukTable('locations-table', [
          ['A', '-', '20', '10', '30', '-', '-'],
          ['A-1', '-', '10', '5', '15', '-', '-'],
          ['A-1-001', 'A1-01', '2', '1', '3', 'Normal accommodation', 'Yes'],
          ['A-1-002', 'A1-02', '2', '1', '3', 'Normal accommodation', 'Yes'],
          ['A-1-003', 'A1-03', '2', '1', '3', 'Normal accommodation', 'Yes'],
          ['A-1-004', 'A1-04', '2', '1', '3', 'Normal accommodation', 'Yes'],
          ['A-1-005', 'A1-05', '2', '1', '3', 'Normal accommodation', 'Yes'],
          ['A-2', '-', '10', '5', '15', '-', '-'],
          ['A-2-001', 'A2-01', '2', '1', '3', 'Normal accommodation', 'Yes'],
          ['A-2-002', 'A2-02', '2', '1', '3', 'Normal accommodation', 'Yes'],
          ['A-2-003', 'A2-03', '2', '1', '3', 'Normal accommodation', 'Yes'],
          ['A-2-004', 'A2-04', '2', '1', '3', 'Normal accommodation', 'Yes'],
          ['A-2-005', 'A2-05', '2', '1', '3', 'Normal accommodation', 'Yes'],
        ])
      })
    })

    context('When the approvalType is SIGNED_OP_CAP', () => {
      beforeEach(() => {
        LocationsApiStubber.stub.stubLocationsCertificationRequestApprovals(
          CertificationApprovalRequestFactory.build({
            approvalType: 'SIGNED_OP_CAP',
            locations: [],
          }),
        )

        CellCertificateChangeRequestsShowPage.goTo('id1')
        Page.verifyOnPage(CellCertificateChangeRequestsShowPage)
      })

      it('Correctly displays the change request info', () => {
        cy.get('h1').should('contain', 'Change signed operational capacity request details')

        testGovukSummaryList('overview-list', [
          ['Location', 'A'],
          ['Change type', 'Change signed operational capacity'],
          ['Explanation', 'Needed to change it'],
          ['Submitted on', '3 October 2024'],
          ['Submitted by', 'john smith'],
          ['Status', 'Awaiting approval'],
        ])

        testGovukTable('cap-change-table', [['TST', '5 → 9']])
      })
    })
  })
})
