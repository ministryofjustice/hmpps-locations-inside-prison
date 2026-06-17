import setupStubs from './setupStubs'
import Page from '../../../pages/page'
import ViewLocationsShowPage from '../../../pages/viewLocations/show'
import SetCellTypeTypePage from '../../../pages/setCellType/type'
import SetCellTypeNormalPage from '../../../pages/setCellType/normal'
import CellConversionCertFlowCapacityPage from '../../../pages/cellConversion/certificationFlow/capacity'
import goToSetCellTypeTypePage from './goToSetCellTypeTypePage'

context('Cell conversion - Cert flow - Set cell type - Normal', () => {
  let page: SetCellTypeNormalPage

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RES_LOCATIONS_OP_CAP'])
      const typePage = goToSetCellTypeTypePage()
      typePage.submit({ normal: true })
      page = Page.verifyOnPage(SetCellTypeNormalPage)
    })

    it('has a back link to the previous step', () => {
      page.backLink().click()
      Page.verifyOnPage(SetCellTypeTypePage)
    })

    it('has a cancel link to the view location show page', () => {
      page.cancelLink().click()
      Page.verifyOnPage(ViewLocationsShowPage)
    })

    it('shows the correct validation error when no normal type is selected', () => {
      page.submit({ types: [] })

      Page.checkForError('set-cell-type_normalCellTypes', 'Select a cell type')
    })

    it('returns to capacity after saving the normal type', () => {
      page.submit({ types: ['NORMAL_ACCOMMODATION'] })

      Page.verifyOnPage(CellConversionCertFlowCapacityPage)
      cy.get('[data-qa^=cell-types-]').contains('Normal accommodation')
    })
  })
})
