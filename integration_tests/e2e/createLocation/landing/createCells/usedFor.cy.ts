import setupStubs from '../setupStubs'
import Page from '../../../../pages/page'
import ViewLocationsShowPage from '../../../../pages/viewLocations/show'
import goToCreateCellsUsedForPage from './goToCreateCellsUsedForPage'
import CreateCellsUsedForPage from '../../../../pages/commonTransactions/createCells/usedFor'
import CreateCellsBulkSanitationPage from '../../../../pages/commonTransactions/createCells/bulkSanitation'
import CreateCellsCapacitiesPage from '../../../../pages/commonTransactions/createCells/capacities'

context('Create landing - Create cells - Used for', () => {
  let page: CreateCellsUsedForPage

  context('With MANAGE_RESIDENTIAL_LOCATIONS role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RESIDENTIAL_LOCATIONS'])
      page = goToCreateCellsUsedForPage()
    })

    it('navigates to the next step when validation passes', () => {
      page.submit()

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
