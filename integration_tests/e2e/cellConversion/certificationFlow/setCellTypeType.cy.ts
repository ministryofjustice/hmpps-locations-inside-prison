import setupStubs from './setupStubs'
import Page from '../../../pages/page'
import ViewLocationsShowPage from '../../../pages/viewLocations/show'
import CellConversionCertFlowCapacityPage from '../../../pages/cellConversion/certificationFlow/capacity'
import SetCellTypeTypePage from '../../../pages/setCellType/type'
import SetCellTypeNormalPage from '../../../pages/setCellType/normal'
import SetCellTypeSpecialPage from '../../../pages/setCellType/special'
import goToSetCellTypeTypePage from './goToSetCellTypeTypePage'

context('Cell conversion - Cert flow - Set cell type - Type', () => {
  let page: SetCellTypeTypePage

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RES_LOCATIONS_OP_CAP'])
      page = goToSetCellTypeTypePage()
    })

    it('has a back link to the previous step', () => {
      page.backLink().click()
      Page.verifyOnPage(CellConversionCertFlowCapacityPage)
    })

    it('has a cancel link to the view location show page', () => {
      page.cancelLink().click()
      Page.verifyOnPage(ViewLocationsShowPage)
    })

    it('shows the correct validation error when no type is selected', () => {
      page.submit({})

      Page.checkForError('set-cell-type_accommodationType', 'Select if it is a normal or special cell type')
    })

    it('continues to the normal type step when normal is selected', () => {
      page.submit({ normal: true })

      Page.verifyOnPage(SetCellTypeNormalPage)
    })

    it('continues to the special type step when special is selected', () => {
      page.submit({ special: true })

      Page.verifyOnPage(SetCellTypeSpecialPage)
    })
  })
})
