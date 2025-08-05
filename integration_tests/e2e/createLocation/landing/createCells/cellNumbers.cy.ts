import setupStubs from '../setupStubs'
import Page from '../../../../pages/page'
import CreateCellsCellNumbersPage from '../../../../pages/commonTransactions/createCells/cellNumbers'
import ViewLocationsShowPage from '../../../../pages/viewLocations/show'
import goToCreateCellsCellNumbersPage from './goToCreateCellsCellNumbersPage'
import CreateCellsDetailsPage from '../../../../pages/commonTransactions/createCells/details'
import CreateCellsDoorNumbersPage from '../../../../pages/commonTransactions/createCells/doorNumbers'

context('Create landing - Create cells - Cell numbers', () => {
  let page: CreateCellsCellNumbersPage

  context('With MANAGE_RESIDENTIAL_LOCATIONS role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RESIDENTIAL_LOCATIONS'])
      page = goToCreateCellsCellNumbersPage()
    })

    it('shows the correct error when 2 or more cells have the same cell number', () => {
      page.submit({
        cellNumbers: ['0', '0', '0', '3'],
      })

      page.checkForError('create-cells_cellNumber0', 'Cell 1 and cell 2 have the same cell number')
      page.checkForError('create-cells_cellNumber1', 'Cell 1 and cell 2 have the same cell number')
      page.checkForError('create-cells_cellNumber2', 'Cell 1 and cell 3 have the same cell number')
    })

    it('shows the correct error when a cell number is not present', () => {
      page.submit({
        cellNumbers: ['', '', '2', '3'],
      })

      page.checkForError('create-cells_cellNumber0', 'Enter a cell number for cell 1')
      page.checkForError('create-cells_cellNumber1', 'Enter a cell number for cell 2')
    })

    it('shows the correct error when start numbering value is not a number', () => {
      page.startCreateCellInput().type('x')
      page.applyLink().click()
      page.checkForError('startCreateCellNumber', 'Enter a valid starting cell number')
    })

    it('shows the correct error when start numbering value is empty', () => {
      page.applyLink().click()
      page.checkForError('startCreateCellNumber', 'Enter a number to start cell numbering from')
    })

    it('navigates to the next step with js populated numbers', () => {
      page.submitWithNumberingFrom('1')

      Page.verifyOnPage(CreateCellsDoorNumbersPage)
    })

    it('navigates to the next step when validation passes', () => {
      page.submit({
        cellNumbers: ['0', '1', '2', '3'],
      })

      Page.verifyOnPage(CreateCellsDoorNumbersPage)
    })

    it('has a back link to the previous step', () => {
      page.backLink().click()

      Page.verifyOnPage(CreateCellsDetailsPage)
    })

    it('has a cancel link to the view location show page', () => {
      page.cancelLink().click()

      Page.verifyOnPage(ViewLocationsShowPage)
    })
  })
})
