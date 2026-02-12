import setupStubs from '../setupStubs'
import Page from '../../../pages/page'
import LocationsApiStubber from '../../../mockApis/locationsApi'
import CertificationApprovalRequestFactory from '../../../../server/testutils/factories/certificationApprovalRequest'
import CellCertificateChangeRequestsIndexPage from '../../../pages/cellCertificate/changeRequests'
import CellCertificateChangeRequestsWithdrawPage from '../../../pages/cellCertificate/changeRequests/withdraw'

context('Cell Certificate - Change Requests - Withdraw', () => {
  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RES_LOCATIONS_OP_CAP'])
      cy.signIn()
    })

    let withdrawPage: CellCertificateChangeRequestsWithdrawPage

    context('When the approvalType is DRAFT', () => {
      beforeEach(() => {
        LocationsApiStubber.stub.stubLocationsCertificationRequestApprovals(CertificationApprovalRequestFactory.build())
        LocationsApiStubber.stub.stubLocationsCertificationLocationWithdraw()

        CellCertificateChangeRequestsWithdrawPage.goTo('id1')
        withdrawPage = Page.verifyOnPage(CellCertificateChangeRequestsWithdrawPage)
      })

      it('Displays an error when no explanation is entered', () => {
        withdrawPage.submit({})
        Page.checkForError('explanation', 'Explain why you are withdrawing this request')
      })

      it('Redirects to change requests and displays a banner', () => {
        withdrawPage.submit({ explanation: 'Not good enough' })

        Page.verifyOnPage(CellCertificateChangeRequestsIndexPage)
        cy.get('#govuk-notification-banner-title').contains('Success')
        cy.get('.govuk-notification-banner__content h3').contains('Change request withdrawn')
        cy.get('.govuk-notification-banner__content p').contains(
          'You have withdrawn the change request for cell A-1-001.',
        )
      })
    })

    context('When the approvalType is CELL_MARK', () => {
      beforeEach(() => {
        LocationsApiStubber.stub.stubLocationsCertificationRequestApprovals(
          CertificationApprovalRequestFactory.build({
            approvalType: 'CELL_MARK',
          }),
        )
        LocationsApiStubber.stub.stubLocationsCertificationLocationWithdraw()

        CellCertificateChangeRequestsWithdrawPage.goTo('id1')
        withdrawPage = Page.verifyOnPage(CellCertificateChangeRequestsWithdrawPage)
      })

      it('Displays an error when no explanation is entered', () => {
        withdrawPage.submit({})
        Page.checkForError('explanation', 'Explain why you are withdrawing this request')
      })

      it('Redirects to change requests and displays a banner', () => {
        withdrawPage.submit({ explanation: 'Not good enough' })

        Page.verifyOnPage(CellCertificateChangeRequestsIndexPage)
        cy.get('#govuk-notification-banner-title').contains('Success')
        cy.get('.govuk-notification-banner__content h3').contains('Change request withdrawn')
        cy.get('.govuk-notification-banner__content p').contains(
          'You have withdrawn the change request for cell A-1-001.',
        )
      })
    })

    context('When the approvalType is CELL_SANITATION', () => {
      beforeEach(() => {
        LocationsApiStubber.stub.stubLocationsCertificationRequestApprovals(
          CertificationApprovalRequestFactory.build({
            approvalType: 'CELL_SANITATION',
          }),
        )
        LocationsApiStubber.stub.stubLocationsCertificationLocationWithdraw()

        CellCertificateChangeRequestsWithdrawPage.goTo('id1')
        withdrawPage = Page.verifyOnPage(CellCertificateChangeRequestsWithdrawPage)
      })

      it('Displays an error when no explanation is entered', () => {
        withdrawPage.submit({})
        Page.checkForError('explanation', 'Explain why you are withdrawing this request')
      })

      it('Redirects to change requests and displays a banner', () => {
        withdrawPage.submit({ explanation: 'Not good enough' })

        Page.verifyOnPage(CellCertificateChangeRequestsIndexPage)
        cy.get('#govuk-notification-banner-title').contains('Success')
        cy.get('.govuk-notification-banner__content h3').contains('Change request withdrawn')
        cy.get('.govuk-notification-banner__content p').contains(
          'You have withdrawn the change request for cell A-1-001.',
        )
      })
    })
  })
})
