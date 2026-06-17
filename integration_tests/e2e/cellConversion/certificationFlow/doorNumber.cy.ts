import setupStubs from './setupStubs'
import Page from '../../../pages/page'
import ViewLocationsShowPage from '../../../pages/viewLocations/show'
import CellConversionUsedForPage from '../../../pages/cellConversion/usedFor'
import CellConversionCertFlowDoorNumberPage from '../../../pages/cellConversion/certificationFlow/doorNumber'
import CellConversionCertFlowCapacityPage from '../../../pages/cellConversion/certificationFlow/capacity'
import goToDoorNumberPage, { goToDoorNumberPageViaNonNormal } from './goToDoorNumberPage'

context('Cell conversion - Cert flow - Door number', () => {
  let page: CellConversionCertFlowDoorNumberPage

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RES_LOCATIONS_OP_CAP'])
    })

    context('when coming via NORMAL_ACCOMMODATION and used for', () => {
      beforeEach(() => {
        page = goToDoorNumberPage()
      })

      it('has a back link to the used for page', () => {
        page.backLink().click()
        Page.verifyOnPage(CellConversionUsedForPage)
      })

      it('has a cancel link to the view location show page', () => {
        page.cancelLink().click()
        Page.verifyOnPage(ViewLocationsShowPage)
      })

      it('shows a table with the cell number and door number input', () => {
        cy.get('[data-qa=door-number-table]').should('exist')
        cy.get('[data-qa=door-number-table] th').eq(0).contains('Cell number')
        cy.get('[data-qa=door-number-table] th').eq(1).contains('Cell door number')
        cy.get('[data-qa=door-number-table] th').eq(2).contains('A-1-001')
      })

      it('shows an inset text about door numbers', () => {
        cy.get('.govuk-inset-text').contains(
          'This is the actual number written on the cell door. It may be different to the cell number.',
        )
      })

      it('shows a validation error when nothing is entered', () => {
        page.submit({})

        Page.checkForError('doorNumber', 'Enter a door number')
      })

      it('continues to the capacity page', () => {
        page.submit({ doorNumber: 'B-01' })
        Page.verifyOnPage(CellConversionCertFlowCapacityPage)
      })
    })

    context('when coming via a non-normal accommodation type', () => {
      beforeEach(() => {
        page = goToDoorNumberPageViaNonNormal()
      })

      it('continues to the capacity page', () => {
        page.submit({ doorNumber: 'C-01' })
        Page.verifyOnPage(CellConversionCertFlowCapacityPage)
      })
    })
  })
})
