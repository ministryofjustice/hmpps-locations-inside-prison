import setupStubs from './setupStubs'
import Page from '../../../pages/page'
import ViewLocationsShowPage from '../../../pages/viewLocations/show'
import SubmitCertificationApprovalRequestPage from '../../../pages/commonTransactions/submitCertificationApprovalRequest'
import UpdateSignedOpCapIsUpdateNeededPage from '../../../pages/commonTransactions/updateSignedOpCap/isUpdateNeeded'
import UpdateSignedOpCapDetailsPage from '../../../pages/commonTransactions/updateSignedOpCap/details'
import CellCertificateChangeRequestsIndexPage from '../../../pages/cellCertificate/changeRequests'
import NonResidentialConversionDetailsPage from '../../../pages/nonResidentialConversion/details'
import goToSubmitCertificationApprovalRequestPage from './goToSubmitCertificationApprovalRequestPage'

context('Non-residential conversion - Cert flow - Submit certification approval request', () => {
  context('Without an operational capacity change', () => {
    let page: SubmitCertificationApprovalRequestPage

    beforeEach(() => {
      setupStubs()
      page = goToSubmitCertificationApprovalRequestPage(false)
    })

    it('has a back link to the update needed page', () => {
      page.backLink().click()

      Page.verifyOnPage(UpdateSignedOpCapIsUpdateNeededPage)
    })

    it('has a cancel link to the view location show page', () => {
      page.cancelLink().click()

      Page.verifyOnPage(ViewLocationsShowPage)
    })

    it('shows the cell conversion approval request only', () => {
      page.request('CONVERT_CELL_TO_ROOM').should('exist')
      page.request('SIGNED_OP_CAP').should('not.exist')
    })

    it('shows a validation error when the confirmation checkbox is not checked', () => {
      page.submit({})

      Page.checkForError('submit-certification-approval-request_confirmation', 'Confirm that changes have been agreed')
    })

    context('Edit links', () => {
      it('allows the convert cell to room reason change link to edit details and return via back link', () => {
        page.changeLink('CONVERT_CELL_TO_ROOM', 'reasonForChange').click()

        const detailsPage = Page.verifyOnPage(NonResidentialConversionDetailsPage)
        detailsPage.backLink().click()

        Page.verifyOnPage(SubmitCertificationApprovalRequestPage)
      })

      it('shows the previously entered values on the convert cell to room edit page and saves changes', () => {
        page.changeLink('CONVERT_CELL_TO_ROOM', 'reasonForChange').click()

        const detailsPage = Page.verifyOnPage(NonResidentialConversionDetailsPage)
        detailsPage.cellTypeRadioItem('OFFICE').should('be.checked')
        detailsPage.explanationInput().should('have.value', 'Want to change the room usage')

        detailsPage.submit({
          convertedCellType: 'OTHER',
          otherConvertedCellType: 'pet therapy room',
          explanation: 'Need a pet therapy room',
        })

        page = Page.verifyOnPage(SubmitCertificationApprovalRequestPage)
        page.request('CONVERT_CELL_TO_ROOM').contains('Other - pet therapy room')
        page.request('CONVERT_CELL_TO_ROOM').contains('Need a pet therapy room')
      })
    })

    it('submits and redirects to change requests on success', () => {
      page.submit({ confirm: true })

      Page.verifyOnPage(CellCertificateChangeRequestsIndexPage)
      Page.checkForSuccessBanner('Change request sent', 'You have submitted a request to update the cell certificate.')
    })
  })

  context('With an operational capacity change', () => {
    let page: SubmitCertificationApprovalRequestPage

    beforeEach(() => {
      setupStubs()
      page = goToSubmitCertificationApprovalRequestPage(true)
    })

    it('has a back link to the signed op cap details page', () => {
      page.backLink().click()

      Page.verifyOnPage(UpdateSignedOpCapDetailsPage)
    })

    it('has a cancel link to the view location show page', () => {
      page.cancelLink().click()

      Page.verifyOnPage(ViewLocationsShowPage)
    })

    it('shows both approval requests', () => {
      page.request('CONVERT_CELL_TO_ROOM').should('exist')
      page.request('SIGNED_OP_CAP').should('exist')
    })

    it('shows a validation error when the confirmation checkbox is not checked', () => {
      page.submit({})

      Page.checkForError('submit-certification-approval-request_confirmation', 'Confirm that changes have been agreed')
    })

    context('Edit links', () => {
      it('allows the convert cell to room reason change link to edit details and return via back link', () => {
        page.changeLink('CONVERT_CELL_TO_ROOM', 'reasonForChange').click()

        const detailsPage = Page.verifyOnPage(NonResidentialConversionDetailsPage)
        detailsPage.backLink().click()

        Page.verifyOnPage(SubmitCertificationApprovalRequestPage)
      })

      it('allows the signed op cap reason change link to edit details and return via back link', () => {
        page.changeLink('SIGNED_OP_CAP', 'reasonForChange').click()

        const detailsPage = Page.verifyOnPage(UpdateSignedOpCapDetailsPage)
        detailsPage.backLink().click()

        Page.verifyOnPage(SubmitCertificationApprovalRequestPage)
      })

      it('shows the previously entered values on the convert cell to room edit page and saves changes', () => {
        page.changeLink('CONVERT_CELL_TO_ROOM', 'reasonForChange').click()

        const detailsPage = Page.verifyOnPage(NonResidentialConversionDetailsPage)
        detailsPage.cellTypeRadioItem('OFFICE').should('be.checked')
        detailsPage.explanationInput().should('have.value', 'Want to change the room usage')

        detailsPage.submit({
          convertedCellType: 'OTHER',
          otherConvertedCellType: 'pet therapy room',
          explanation: 'Need a pet therapy room',
        })

        page = Page.verifyOnPage(SubmitCertificationApprovalRequestPage)
        page.request('CONVERT_CELL_TO_ROOM').contains('Other - pet therapy room')
        page.request('CONVERT_CELL_TO_ROOM').contains('Need a pet therapy room')
      })

      it('shows the previously entered values on the signed op cap edit page and saves changes', () => {
        page.changeLink('SIGNED_OP_CAP', 'reasonForChange').click()

        const detailsPage = Page.verifyOnPage(UpdateSignedOpCapDetailsPage)
        detailsPage.opCapInput().should('have.value', '8')
        detailsPage.explanationInput().should('have.value', 'Updating the signed operational capacity')

        detailsPage.submit({ opCap: 7, explanation: 'Reducing the signed operational capacity' })

        page = Page.verifyOnPage(SubmitCertificationApprovalRequestPage)
        page.request('SIGNED_OP_CAP').contains('Reducing the signed operational capacity')
        cy.get('[data-qa="cap-change-table"]').contains('9 → 7')
      })
    })

    it('submits and redirects to change requests on success', () => {
      page.submit({ confirm: true })

      Page.verifyOnPage(CellCertificateChangeRequestsIndexPage)
      Page.checkForSuccessBanner(
        'Change requests sent',
        'You have submitted 2 requests to update the cell certificate.',
      )
    })
  })
})
