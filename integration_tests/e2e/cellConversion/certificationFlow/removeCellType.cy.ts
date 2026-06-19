import setupStubs from './setupStubs'
import Page from '../../../pages/page'
import CellConversionCertFlowCapacityPage from '../../../pages/cellConversion/certificationFlow/capacity'
import SetCellTypeSpecialPage from '../../../pages/setCellType/special'
import goToSetCellTypeTypePage from './goToSetCellTypeTypePage'

context('Cell conversion - Cert flow - Remove cell type', () => {
  let page: CellConversionCertFlowCapacityPage

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RES_LOCATIONS_OP_CAP'])

      const typePage = goToSetCellTypeTypePage()
      typePage.submit({ special: true })

      const specialPage = Page.verifyOnPage(SetCellTypeSpecialPage)
      specialPage.submit({ type: 'BIOHAZARD_DIRTY_PROTEST' })

      page = Page.verifyOnPage(CellConversionCertFlowCapacityPage)
      cy.get('[data-qa^=cell-types-]').contains('Biohazard / dirty protest cell')
    })

    it('removes the saved cell type and returns to the capacity step', () => {
      page.cellTypeActionButton('remove').click()

      Page.verifyOnPage(CellConversionCertFlowCapacityPage)
      cy.get('[data-qa^=cell-types-]').contains('Add')
      cy.get('[data-qa^=cell-types-]').contains('Biohazard / dirty protest cell').should('not.exist')
    })

    it('still allows progress to the next step after removing cell type', () => {
      page.cellTypeActionButton('remove').click()
      page = Page.verifyOnPage(CellConversionCertFlowCapacityPage)

      page.submit({ baselineCna: '1', workingCapacity: '1', maximumCapacity: '2' })
      cy.get('h2').contains('Does the cell have in-cell sanitation?')
    })
  })
})
