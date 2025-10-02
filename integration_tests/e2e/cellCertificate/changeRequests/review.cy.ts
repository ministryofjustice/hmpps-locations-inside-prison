import setupStubs from '../setupStubs'
import Page from '../../../pages/page'
import testGovukTable from '../../../support/testGovukTable'
import testGovukSummaryList from '../../../support/testGovukSummaryList'
import LocationsApiStubber from '../../../mockApis/locationsApi'
import CertificationApprovalRequestFactory from '../../../../server/testutils/factories/certificationApprovalRequest'
import CellCertificateChangeRequestsReviewPage from '../../../pages/cellCertificate/changeRequests/review/review'
import CellCertificateChangeRequestsApprovePage from '../../../pages/cellCertificate/changeRequests/review/approve'
import CellCertificateChangeRequestsIndexPage from '../../../pages/cellCertificate/changeRequests'
import CellCertificateChangeRequestsRejectPage from '../../../pages/cellCertificate/changeRequests/review/reject'

context('Cell Certificate - Change Requests - Review', () => {
  context('With MANAGE_RESIDENTIAL_LOCATIONS role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RESIDENTIAL_LOCATIONS'])
      cy.signIn()
    })

    let reviewPage: CellCertificateChangeRequestsReviewPage

    context('When the approvalType is DRAFT', () => {
      beforeEach(() => {
        LocationsApiStubber.stub.stubLocationsCertificationRequestApprovals(CertificationApprovalRequestFactory.build())

        CellCertificateChangeRequestsReviewPage.goTo('id1')
        reviewPage = Page.verifyOnPage(CellCertificateChangeRequestsReviewPage)
      })

      it('Correctly displays the change request info', () => {
        cy.get('h1').should('contain', 'Review add new locations request')

        testGovukSummaryList('overview-list', [
          ['Location', 'A'],
          ['Change type', 'Add new locations to certificate'],
          ['Submitted on', '3 October 2024'],
          ['Submitted by', 'john smith'],
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

      it('Displays an error when no option is checked', () => {
        reviewPage.submit({})
        reviewPage.checkForError('approveOrReject', 'Select if you want to approve or reject this change')
      })

      context('When approving', () => {
        let approvePage: CellCertificateChangeRequestsApprovePage
        beforeEach(() => {
          LocationsApiStubber.stub.stubLocationsCertificationLocationApprove()

          reviewPage.submit({ approve: true })
          approvePage = Page.verifyOnPage(CellCertificateChangeRequestsApprovePage)
        })

        it('Displays an error when the legal disclaimer is not checked', () => {
          approvePage.submit({})
          reviewPage.checkForError('cellsMeetStandards', 'Confirm that the cells meet the certification standards')
        })

        it('Redirects to change requests and displays a banner', () => {
          approvePage.submit({ confirm: true })

          Page.verifyOnPage(CellCertificateChangeRequestsIndexPage)
          cy.get('#govuk-notification-banner-title').contains('Success')
          cy.get('.govuk-notification-banner__content h3').contains('Cell certificate updated')
          cy.get('.govuk-notification-banner__content p').contains(
            'The establishment has been notified that the change request has been approved.',
          )
        })
      })

      context('When rejecting', () => {
        let rejectPage: CellCertificateChangeRequestsRejectPage
        beforeEach(() => {
          LocationsApiStubber.stub.stubLocationsCertificationLocationReject()

          reviewPage.submit({ approve: false })
          rejectPage = Page.verifyOnPage(CellCertificateChangeRequestsRejectPage)
        })

        it('Displays an error when no explanation is entered', () => {
          rejectPage.submit({})
          reviewPage.checkForError('explanation', 'Explain why you are rejecting this request')
        })

        it('Redirects to change requests and displays a banner', () => {
          rejectPage.submit({ explanation: 'Not good enough' })

          Page.verifyOnPage(CellCertificateChangeRequestsIndexPage)
          cy.get('#govuk-notification-banner-title').contains('Success')
          cy.get('.govuk-notification-banner__content h3').contains('Change request rejected')
          cy.get('.govuk-notification-banner__content p').contains(
            'The establishment has been notified that the requested change has been rejected.',
          )
        })
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

        CellCertificateChangeRequestsReviewPage.goTo('id1')
        reviewPage = Page.verifyOnPage(CellCertificateChangeRequestsReviewPage)
      })

      it('Correctly displays the change request info', () => {
        cy.get('h1').should('contain', 'Review change signed operational capacity request')

        testGovukSummaryList('overview-list', [
          ['Location', 'A'],
          ['Change type', 'Change signed operational capacity'],
          ['Explanation', 'Needed to change it'],
          ['Submitted on', '3 October 2024'],
          ['Submitted by', 'john smith'],
        ])

        testGovukTable('cap-change-table', [['TST', '5 → 9']])
      })
    })
  })
})
