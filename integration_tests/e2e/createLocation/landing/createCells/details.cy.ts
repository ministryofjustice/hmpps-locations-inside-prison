import goToCreateCellsDetailsPage from './goToCreateCellsDetailsPage'
import setupStubs from '../setupStubs'
import CreateCellsDetailsPage from '../../../../pages/commonTransactions/createCells/details'
import Page from '../../../../pages/page'
import CreateCellsCellNumbersPage from '../../../../pages/commonTransactions/createCells/cellNumbers'
import ViewLocationsShowPage from '../../../../pages/viewLocations/show'
import CreateLocationDetailsPage from '../../../../pages/createLocation'

context('Create landing - Create cells - Details', () => {
  let page: CreateCellsDetailsPage

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RES_LOCATIONS_OP_CAP'])
      page = goToCreateCellsDetailsPage()
    })

    it('shows the correct validation error when create cells has no input value', () => {
      page.submit({
        accommodationType: 'NORMAL_ACCOMMODATION',
      })

      page.checkForError('create-cells_cellsToCreate', 'Enter how many cells you want to create')
    })

    it('shows the correct validation error when create cells has non numeric input', () => {
      page.submit({
        cellsToCreate: 'loads of cells' as unknown as number,
        accommodationType: 'NORMAL_ACCOMMODATION',
      })

      page.checkForError('create-cells_cellsToCreate', 'Enter the number of cells you want to create')
    })

    it('shows the correct validation error when create cells input is over 999', () => {
      page.submit({
        cellsToCreate: 1000,
        accommodationType: 'NORMAL_ACCOMMODATION',
      })

      page.checkForError('create-cells_cellsToCreate', 'You can create a maximum of 999 cells at once')
    })

    it('shows the correct validation error when no accommodation type is selected', () => {
      page.submit({
        cellsToCreate: 1000,
      })

      page.checkForError('create-cells_accommodationType', 'Select an accommodation type')
    })

    it('navigates to the next step when validation passes', () => {
      page.submit({
        cellsToCreate: 4,
        accommodationType: 'NORMAL_ACCOMMODATION',
      })

      Page.verifyOnPage(CreateCellsCellNumbersPage)
    })

    it('has a back link to the previous step', () => {
      page.backLink().click()

      Page.verifyOnPage(CreateLocationDetailsPage)
    })

    it('has a cancel link to the view location show page', () => {
      page.cancelLink().click()

      Page.verifyOnPage(ViewLocationsShowPage)
    })
  })
})
