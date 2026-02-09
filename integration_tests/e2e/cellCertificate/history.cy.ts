import setupStubs from './setupStubs'
import Page from '../../pages/page'
import testGovukTable from '../../support/testGovukTable'
import CellCertificateHistoryPage from '../../pages/cellCertificate/history'
import LocationsApiStubber from '../../mockApis/locationsApi'
import CellCertificateFactory from '../../../server/testutils/factories/cellCertificate'
import CertificationApprovalRequestFactory from '../../../server/testutils/factories/certificationApprovalRequest'

context('Cell Certificate - History', () => {
  context('With default access', () => {
    beforeEach(() => {
      setupStubs([])
      cy.signIn()
    })

    context('when there are certificates', () => {
      beforeEach(() => {
        LocationsApiStubber.stub.stubLocationsCellCertificatesPrison([
          CellCertificateFactory.build({
            current: true,
            approvedRequest: CertificationApprovalRequestFactory.build({
              approvalType: 'SIGNED_OP_CAP',
              locationKey: undefined,
            }),
          }),
          CellCertificateFactory.build({
            approvedRequest: CertificationApprovalRequestFactory.build({}),
          }),
        ])

        CellCertificateHistoryPage.goTo()
        Page.verifyOnPage(CellCertificateHistoryPage)
      })

      it('Correctly displays the history', () => {
        testGovukTable('change-requests-history-table', [
          [
            'TST',
            'Change signed operational capacity',
            '3 October 2024',
            'john smith',
            ['View details', 'View certificate'],
          ],
          [
            'A',
            'Add new locations to certificate',
            '3 October 2024',
            'john smith',
            ['View details', 'View certificate'],
          ],
        ])
      })
    })

    context('when there are no certificates', () => {
      beforeEach(() => {
        LocationsApiStubber.stub.stubLocationsCellCertificatesPrison([])

        CellCertificateHistoryPage.goTo()
        Page.verifyOnPage(CellCertificateHistoryPage)
      })

      it('States that there is no history', () => {
        cy.get('.govuk-inset-text').should(
          'contain',
          "There are no changes to the establishment's cell certificate currently",
        )
      })
    })
  })
})
