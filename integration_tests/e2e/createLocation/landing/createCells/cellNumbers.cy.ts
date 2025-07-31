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

    // it('shows the correct error when 2 or more cells have the same door number', () => {
    //   page.submit({
    //     doorNumbers: ['0', '0', '0', '3'],
    //   })
    //
    //   page.checkForError('create-cells_doorNumber0', 'Cell A-001 and cell A-002 have the same cell door number')
    //   page.checkForError('create-cells_doorNumber1', 'Cell A-001 and cell A-002 have the same cell door number')
    //   page.checkForError('create-cells_doorNumber2', 'Cell A-001 and cell A-003 have the same cell door number')
    // })
    //
    // it('shows the correct error when a door number is not present', () => {
    //   page.submit({
    //     doorNumbers: ['', '', '2', '3'],
    //   })
    //
    //   page.checkForError('create-cells_doorNumber0', 'Enter a cell door number for A-001')
    //   page.checkForError('create-cells_doorNumber1', 'Enter a cell door number for A-002')
    // })

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
