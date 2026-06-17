import setupStubs from './setupStubs'
import Page from '../../../pages/page'
import ViewLocationsShowPage from '../../../pages/viewLocations/show'
import SetCellTypeTypePage from '../../../pages/setCellType/type'
import SetCellTypeSpecialPage from '../../../pages/setCellType/special'
import CellConversionCertFlowCapacityPage from '../../../pages/cellConversion/certificationFlow/capacity'
import goToSetCellTypeTypePage from './goToSetCellTypeTypePage'

context('Cell conversion - Cert flow - Set cell type - Special', () => {
  let page: SetCellTypeSpecialPage

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RES_LOCATIONS_OP_CAP'])
      const typePage = goToSetCellTypeTypePage()
      typePage.submit({ special: true })
      page = Page.verifyOnPage(SetCellTypeSpecialPage)
    })

    it('has a back link to the previous step', () => {
      page.backLink().click()
      Page.verifyOnPage(SetCellTypeTypePage)
    })

    it('has a cancel link to the view location show page', () => {
      page.cancelLink().click()
      Page.verifyOnPage(ViewLocationsShowPage)
    })

    it('shows the correct validation error when no special type is selected', () => {
      page.submit({ type: '' })

      Page.checkForError('set-cell-type_specialistCellTypes', 'Select a cell type')
    })

    it('returns to capacity after saving the special type', () => {
      page.submit({ type: 'BIOHAZARD_DIRTY_PROTEST' })

      const capacityPage = Page.verifyOnPage(CellConversionCertFlowCapacityPage)
      cy.get('[data-qa^=cell-types-]').contains('Biohazard / dirty protest cell')

      capacityPage.cellTypeActionButton('remove').click()
      Page.verifyOnPage(CellConversionCertFlowCapacityPage)
      cy.get('[data-qa^=cell-types-]').contains('Add')
    })
  })
})
