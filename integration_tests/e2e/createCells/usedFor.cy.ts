import setupStubs from './setupStubs'
import Page from '../../pages/page'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import goToCreateCellsUsedForPage from './goToCreateCellsUsedForPage'
import CreateCellsUsedForPage from '../../pages/commonTransactions/createCells/usedFor'
import CreateCellsBulkSanitationPage from '../../pages/commonTransactions/createCells/bulkSanitation'
import CreateCellsCapacitiesPage from '../../pages/commonTransactions/createCells/capacities'

context('Create landing - Create cells - Used for', () => {
  let page: CreateCellsUsedForPage

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RES_LOCATIONS_OP_CAP'])
      page = goToCreateCellsUsedForPage()
    })

    it('shows the correct error when no types are picked', () => {
      page.submit({ usedFor: [] })

      page.checkForError('create-cells_usedFor', 'Select what the location is used for')
    })

    it('navigates to the next step when validation passes', () => {
      page.submit({ usedFor: ['STANDARD_ACCOMMODATION'] })

      Page.verifyOnPage(CreateCellsBulkSanitationPage)
    })

    it('has a back link to the previous step', () => {
      page.backLink().click()

      Page.verifyOnPage(CreateCellsCapacitiesPage)
    })

    it('has a cancel link to the view location show page', () => {
      page.cancelLink().click()

      Page.verifyOnPage(ViewLocationsShowPage)
    })
  })
})
