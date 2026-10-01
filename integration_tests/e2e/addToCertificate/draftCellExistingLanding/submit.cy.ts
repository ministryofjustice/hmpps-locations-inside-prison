import setupStubs, { draftCell, existingLanding, existingWing } from './setupStubs'
import SubmitCertificationApprovalRequestPage from '../../../pages/commonTransactions/submitCertificationApprovalRequest'
import goToSubmitCertificationApprovalRequest from './goToSubmitCertificationApprovalRequest'
import { Location } from '../../../../server/data/types/locationsApi'
import Page from '../../../pages/page'
import ViewLocationsShowPage from '../../../pages/viewLocations/show'
import CertChangeDisclaimerPage from '../../../pages/commonTransactions/certChangeDisclaimer'
import CellCertificateChangeRequestsIndexPage from '../../../pages/cellCertificate/changeRequests'

const draftCellLocationId = '7e570000-0000-1000-8000-000000000221'

function testRequests(
  page: SubmitCertificationApprovalRequestPage,
  draftRequest: { wing: Location; parentLanding: Location; draftCell: Location },
) {
  page.request('DRAFT').find('h2').should('contain', 'Proposed changes to the certificate')
  page.request('DRAFT').find('h3').should('contain', 'New wing usage')
  page.request('DRAFT').find('h3').should('contain', 'New locations')

  page.request('DRAFT').contains(draftRequest.wing.pathHierarchy)
  page.request('DRAFT').contains(draftRequest.parentLanding.pathHierarchy)
  page.request('DRAFT').contains(draftRequest.draftCell.pathHierarchy)
  page.request('DRAFT').contains(draftRequest.draftCell.cellMark)

  page.request('SIGNED_OP_CAP').should('not.exist')
}

context('Add To Certificate - Draft Cell Existing Landing - Submit', () => {
  let page: SubmitCertificationApprovalRequestPage

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RES_LOCATIONS_OP_CAP'])
      page = goToSubmitCertificationApprovalRequest(draftCellLocationId)
    })

    context('Submit approval request', () => {
      it('displays the correct information', () => {
        testRequests(page, { wing: existingWing, parentLanding: existingLanding, draftCell })
      })

      it('displays the correct validation error when the checkbox is not checked', () => {
        page.submit({})

        Page.checkForError(
          'submit-certification-approval-request_confirmation',
          'Confirm that the cells meet the certification standards',
        )
      })

      it('submits when the checkbox is checked', () => {
        page.submit({ confirm: true })
        Page.verifyOnPage(CellCertificateChangeRequestsIndexPage)

        cy.get('#govuk-notification-banner-title').contains('Success')
        cy.get('.govuk-notification-banner__content h3').contains('Change request sent')
        cy.get('.govuk-notification-banner__content p').contains(
          'You have submitted a request to update the cell certificate.',
        )
      })

      it('has a back link to the certificate change disclaimer', () => {
        page.backLink().click()
        Page.verifyOnPage(CertChangeDisclaimerPage, 'Adding new locations')
      })

      it('has a cancel link to the view location show page', () => {
        page.cancelLink().click()
        Page.verifyOnPage(ViewLocationsShowPage)
      })
    })
  })
})
