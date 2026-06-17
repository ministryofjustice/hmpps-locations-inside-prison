import setupStubs from './setupStubs'
import Page from '../../../pages/page'
import ViewLocationsShowPage from '../../../pages/viewLocations/show'
import CellConversionCertFlowCapacityPage from '../../../pages/cellConversion/certificationFlow/capacity'
import CellConversionCertFlowSanitationPage from '../../../pages/cellConversion/certificationFlow/sanitation'
import SubmitCertificationApprovalRequestPage from '../../../pages/commonTransactions/submitCertificationApprovalRequest'
import goToSanitationPage from './goToSanitationPage'

context('Cell conversion - Cert flow - Sanitation', () => {
  let page: CellConversionCertFlowSanitationPage

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RES_LOCATIONS_OP_CAP'])
      page = goToSanitationPage()
    })

    it('has a back link to the previous step', () => {
      page.backLink().click()
      Page.verifyOnPage(CellConversionCertFlowCapacityPage)
    })

    it('has a cancel link to the view location show page', () => {
      page.cancelLink().click()
      Page.verifyOnPage(ViewLocationsShowPage)
    })

    it('shows a hint about in-cell sanitation', () => {
      cy.get('.govuk-hint').contains('This means a cell includes both a toilet and wash basin.')
    })

    it('shows a validation error when nothing is selected', () => {
      page.submit({})

      Page.checkForError('inCellSanitation', 'Select yes if the cell has in-cell sanitation')
    })

    it('continues to the submit certification approval request page when Yes is selected', () => {
      page.submit({ inCellSanitation: true })

      Page.verifyOnPage(SubmitCertificationApprovalRequestPage)
    })

    it('continues to the submit certification approval request page when No is selected', () => {
      page.submit({ inCellSanitation: false })

      Page.verifyOnPage(SubmitCertificationApprovalRequestPage)
    })
  })
})
