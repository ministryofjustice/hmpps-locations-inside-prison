import setupStubs from './setupStubs'
import CreateCellsDoorNumbersPage from '../../pages/commonTransactions/createCells/doorNumbers'
import goToCreateCellsDoorNumbersPage from './goToCreateCellsDoorNumbersPage'
import Page from '../../pages/page'
import CreateCellsCellNumbersPage from '../../pages/commonTransactions/createCells/cellNumbers'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import CreateCellsCapacitiesPage from '../../pages/commonTransactions/createCells/capacities'

context('Create landing - Create cells - Door numbers', () => {
  let page: CreateCellsDoorNumbersPage

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RES_LOCATIONS_OP_CAP'])
      page = goToCreateCellsDoorNumbersPage()
    })

    it('shows the correct error when 2 or more cells have the same door number', () => {
      page.submit({
        doorNumbers: ['0', '0', '0', '3'],
      })

      page.checkForError('create-cells_doorNumber0', 'Cell A-2-100 and cell A-2-101 have the same cell door number')
      page.checkForError('create-cells_doorNumber1', 'Cell A-2-100 and cell A-2-101 have the same cell door number')
      page.checkForError('create-cells_doorNumber2', 'Cell A-2-100 and cell A-2-102 have the same cell door number')
    })

    it('shows the correct error when a door number is not present', () => {
      page.submit({
        doorNumbers: ['', '', '2', '3'],
      })

      page.checkForError('create-cells_doorNumber0', 'Enter a cell door number for A-2-100')
      page.checkForError('create-cells_doorNumber1', 'Enter a cell door number for A-2-101')
    })

    it('navigates to the next step when validation passes', () => {
      page.submit({
        doorNumbers: ['0', '1', '2', '3'],
      })

      // TODO: change this page when the next step is added
      Page.verifyOnPage(CreateCellsCapacitiesPage)
    })

    it('has a back link to the previous step', () => {
      page.backLink().click()

      Page.verifyOnPage(CreateCellsCellNumbersPage)
    })

    it('has a cancel link to the view location show page', () => {
      page.cancelLink().click()

      Page.verifyOnPage(ViewLocationsShowPage)
    })
  })
})
