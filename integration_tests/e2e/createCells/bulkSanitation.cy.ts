import setupStubs from './setupStubs'
import Page from '../../pages/page'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import CreateCellsUsedForPage from '../../pages/commonTransactions/createCells/usedFor'
import CreateCellsBulkSanitationPage from '../../pages/commonTransactions/createCells/bulkSanitation'
import goToCreateCellsBulkSanitationPage from './goToCreateCellsBulkSanitationPage'
import CreateLocationConfirmPage from '../../pages/createLocation/confirm'
import CreateCellsWithoutSanitationPage from '../../pages/commonTransactions/createCells/withoutSanitation'

context('Create landing - Create cells - Bulk sanitation', () => {
  let page: CreateCellsBulkSanitationPage

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RES_LOCATIONS_OP_CAP'])
      page = goToCreateCellsBulkSanitationPage()
    })

    it('navigates to confirm when yes is picked', () => {
      page.submit({
        bulkSanitation: true,
      })

      Page.verifyOnPage(CreateLocationConfirmPage)
    })

    it('navigates to without sanitation when no is picked', () => {
      page.submit({
        bulkSanitation: false,
      })

      Page.verifyOnPage(CreateCellsWithoutSanitationPage)
    })

    it('has a back link to the previous step', () => {
      page.backLink().click()

      Page.verifyOnPage(CreateCellsUsedForPage)
    })

    it('has a cancel link to the view location show page', () => {
      page.cancelLink().click()

      Page.verifyOnPage(ViewLocationsShowPage)
    })
  })
})
