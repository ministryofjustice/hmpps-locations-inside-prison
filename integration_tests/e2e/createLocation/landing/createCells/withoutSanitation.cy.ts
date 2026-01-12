import setupStubs from '../setupStubs'
import Page from '../../../../pages/page'
import ViewLocationsShowPage from '../../../../pages/viewLocations/show'
import CreateLocationConfirmPage from '../../../../pages/createLocation/confirm'
import CreateCellsWithoutSanitationPage from '../../../../pages/commonTransactions/createCells/withoutSanitation'
import goToCreateCellsWithoutSanitationPage from './goToCreateCellsWithoutSanitationPage'
import CreateCellsBulkSanitationPage from '../../../../pages/commonTransactions/createCells/bulkSanitation'

context('Create landing - Create cells - Without sanitation', () => {
  let page: CreateCellsWithoutSanitationPage

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RES_LOCATIONS_OP_CAP'])
      page = goToCreateCellsWithoutSanitationPage()
    })

    it('displays the correct error message when no cells are picked', () => {
      page.submit({
        withoutSanitation: [],
      })

      Page.checkForError('create-cells_withoutSanitation', 'Select any cells without in-cell sanitation')
    })

    it('navigates to confirm when cells are picked', () => {
      page.submit({
        withoutSanitation: [2, 3],
      })

      Page.verifyOnPage(CreateLocationConfirmPage)
    })

    it('has a back link to the previous step', () => {
      page.backLink().click()

      Page.verifyOnPage(CreateCellsBulkSanitationPage)
    })

    it('has a cancel link to the view location show page', () => {
      page.cancelLink().click()

      Page.verifyOnPage(ViewLocationsShowPage)
    })
  })
})
