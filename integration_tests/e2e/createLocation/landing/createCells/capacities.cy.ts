import setupStubs from '../setupStubs'
import CreateCellsDoorNumbersPage from '../../../../pages/commonTransactions/createCells/doorNumbers'
import Page from '../../../../pages/page'
import ViewLocationsShowPage from '../../../../pages/viewLocations/show'
import CreateCellsCapacitiesPage from '../../../../pages/commonTransactions/createCells/capacities'
import goToCreateCellsCapacitiesPage from './goToCreateCellsCapacitiesPage'
import CreateCellsUsedForPage from '../../../../pages/commonTransactions/createCells/usedFor'
import CreateCellsDetailsPage from '../../../../pages/commonTransactions/createCells/details'
import CreateCellsCellNumbersPage from '../../../../pages/commonTransactions/createCells/cellNumbers'
import CreateCellsBulkSanitationPage from '../../../../pages/commonTransactions/createCells/bulkSanitation'

context('Create landing - Create cells - Capacities', () => {
  let page: CreateCellsCapacitiesPage

  context('With MANAGE_RESIDENTIAL_LOCATIONS role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RESIDENTIAL_LOCATIONS'])
      page = goToCreateCellsCapacitiesPage()
    })

    it('shows the correct error when CNA is 0 for normal accommodation', () => {
      page.submit({
        capacities: [
          ['0', '1', '2'],
          ['0', '1', '2'],
          ['0', '1', '2'],
          ['0', '1', '2'],
        ],
      })

      page.checkForError(
        'create-cells_baselineCna0',
        'Baseline CNA cannot be 0 for a normal accommodation cell',
        'Cell A-2-100: ',
      )
      page.checkForError(
        'create-cells_baselineCna1',
        'Baseline CNA cannot be 0 for a normal accommodation cell',
        'Cell A-2-101: ',
      )
      page.checkForError(
        'create-cells_baselineCna2',
        'Baseline CNA cannot be 0 for a normal accommodation cell',
        'Cell A-2-102: ',
      )
      page.checkForError(
        'create-cells_baselineCna3',
        'Baseline CNA cannot be 0 for a normal accommodation cell',
        'Cell A-2-103: ',
      )
    })

    it('allows CNA of 0 when not normal accommodation', () => {
      CreateCellsDetailsPage.goTo('7e570000-0000-1000-8000-000000000002')
      const detailsPage = Page.verifyOnPage(CreateCellsDetailsPage)
      detailsPage.submit({
        cellsToCreate: 4,
        accommodationType: 'CARE_AND_SEPARATION',
      })

      const cellNumbersPage = Page.verifyOnPage(CreateCellsCellNumbersPage)
      cellNumbersPage.continueButton().click()

      const doorNumbersPage = Page.verifyOnPage(CreateCellsDoorNumbersPage)
      doorNumbersPage.continueButton().click()

      page = Page.verifyOnPage(CreateCellsCapacitiesPage)
      page.submit({
        capacities: [
          ['0', '1', '2'],
          ['0', '1', '2'],
          ['0', '1', '2'],
          ['0', '1', '2'],
        ],
      })

      Page.verifyOnPage(CreateCellsBulkSanitationPage)
    })

    it('show the correct error when CNA and working capacity are more than max capacity', () => {
      page.submit({
        capacities: [
          ['4', '4', '2'],
          ['4', '4', '2'],
          ['4', '4', '2'],
          ['4', '4', '2'],
        ],
      })

      page.checkForError(
        'create-cells_baselineCna0',
        'Baseline CNA cannot be more than the maximum capacity',
        'Cell A-2-100: ',
      )
      page.checkForError(
        'create-cells_baselineCna1',
        'Baseline CNA cannot be more than the maximum capacity',
        'Cell A-2-101: ',
      )
      page.checkForError(
        'create-cells_baselineCna2',
        'Baseline CNA cannot be more than the maximum capacity',
        'Cell A-2-102: ',
      )
      page.checkForError(
        'create-cells_baselineCna3',
        'Baseline CNA cannot be more than the maximum capacity',
        'Cell A-2-103: ',
      )

      page.checkForError(
        'create-cells_workingCapacity0',
        'Working capacity cannot be more than the maximum capacity',
        'Cell A-2-100: ',
      )
      page.checkForError(
        'create-cells_workingCapacity1',
        'Working capacity cannot be more than the maximum capacity',
        'Cell A-2-101: ',
      )
      page.checkForError(
        'create-cells_workingCapacity2',
        'Working capacity cannot be more than the maximum capacity',
        'Cell A-2-102: ',
      )
      page.checkForError(
        'create-cells_workingCapacity3',
        'Working capacity cannot be more than the maximum capacity',
        'Cell A-2-103: ',
      )
    })

    it('show the correct error when capacities are over 99', () => {
      page.submit({
        capacities: [
          ['100', '100', '100'],
          ['100', '100', '100'],
          ['100', '100', '100'],
          ['100', '100', '100'],
        ],
      })

      page.checkForError('create-cells_baselineCna0', 'Baseline CNA cannot be more than 99', 'Cell A-2-100: ')
      page.checkForError('create-cells_baselineCna1', 'Baseline CNA cannot be more than 99', 'Cell A-2-101: ')
      page.checkForError('create-cells_baselineCna2', 'Baseline CNA cannot be more than 99', 'Cell A-2-102: ')
      page.checkForError('create-cells_baselineCna3', 'Baseline CNA cannot be more than 99', 'Cell A-2-103: ')

      page.checkForError('create-cells_workingCapacity0', 'Working capacity cannot be more than 99', 'Cell A-2-100: ')
      page.checkForError('create-cells_workingCapacity1', 'Working capacity cannot be more than 99', 'Cell A-2-101: ')
      page.checkForError('create-cells_workingCapacity2', 'Working capacity cannot be more than 99', 'Cell A-2-102: ')
      page.checkForError('create-cells_workingCapacity3', 'Working capacity cannot be more than 99', 'Cell A-2-103: ')

      page.checkForError('create-cells_maximumCapacity0', 'Maximum capacity cannot be more than 99', 'Cell A-2-100: ')
      page.checkForError('create-cells_maximumCapacity1', 'Maximum capacity cannot be more than 99', 'Cell A-2-101: ')
      page.checkForError('create-cells_maximumCapacity2', 'Maximum capacity cannot be more than 99', 'Cell A-2-102: ')
      page.checkForError('create-cells_maximumCapacity3', 'Maximum capacity cannot be more than 99', 'Cell A-2-103: ')
    })

    it('shows the correct error when capacities are empty', () => {
      page.submit({
        capacities: [
          ['', '', ''],
          ['', '', ''],
          ['', '', ''],
          ['', '', ''],
        ],
      })

      page.checkForError('create-cells_baselineCna0', 'Enter a baseline CNA', 'Cell A-2-100: ')
      page.checkForError('create-cells_baselineCna1', 'Enter a baseline CNA', 'Cell A-2-101: ')
      page.checkForError('create-cells_baselineCna2', 'Enter a baseline CNA', 'Cell A-2-102: ')
      page.checkForError('create-cells_baselineCna3', 'Enter a baseline CNA', 'Cell A-2-103: ')

      page.checkForError('create-cells_workingCapacity0', 'Enter a working capacity', 'Cell A-2-100: ')
      page.checkForError('create-cells_workingCapacity1', 'Enter a working capacity', 'Cell A-2-101: ')
      page.checkForError('create-cells_workingCapacity2', 'Enter a working capacity', 'Cell A-2-102: ')
      page.checkForError('create-cells_workingCapacity3', 'Enter a working capacity', 'Cell A-2-103: ')

      page.checkForError('create-cells_maximumCapacity0', 'Enter a maximum capacity', 'Cell A-2-100: ')
      page.checkForError('create-cells_maximumCapacity1', 'Enter a maximum capacity', 'Cell A-2-101: ')
      page.checkForError('create-cells_maximumCapacity2', 'Enter a maximum capacity', 'Cell A-2-102: ')
      page.checkForError('create-cells_maximumCapacity3', 'Enter a maximum capacity', 'Cell A-2-103: ')
    })

    it('show the correct error when capacities have non-numeric characters', () => {
      page.submit({
        capacities: [
          ['abc', 'abc', 'abc'],
          ['abc', 'abc', 'abc'],
          ['abc', 'abc', 'abc'],
          ['abc', 'abc', 'abc'],
        ],
      })

      page.checkForError('create-cells_baselineCna0', 'Baseline CNA must be a number', 'Cell A-2-100: ')
      page.checkForError('create-cells_baselineCna1', 'Baseline CNA must be a number', 'Cell A-2-101: ')
      page.checkForError('create-cells_baselineCna2', 'Baseline CNA must be a number', 'Cell A-2-102: ')
      page.checkForError('create-cells_baselineCna3', 'Baseline CNA must be a number', 'Cell A-2-103: ')

      page.checkForError('create-cells_workingCapacity0', 'Working capacity must be a number', 'Cell A-2-100: ')
      page.checkForError('create-cells_workingCapacity1', 'Working capacity must be a number', 'Cell A-2-101: ')
      page.checkForError('create-cells_workingCapacity2', 'Working capacity must be a number', 'Cell A-2-102: ')
      page.checkForError('create-cells_workingCapacity3', 'Working capacity must be a number', 'Cell A-2-103: ')

      page.checkForError('create-cells_maximumCapacity0', 'Maximum capacity must be a number', 'Cell A-2-100: ')
      page.checkForError('create-cells_maximumCapacity1', 'Maximum capacity must be a number', 'Cell A-2-101: ')
      page.checkForError('create-cells_maximumCapacity2', 'Maximum capacity must be a number', 'Cell A-2-102: ')
      page.checkForError('create-cells_maximumCapacity3', 'Maximum capacity must be a number', 'Cell A-2-103: ')
    })

    it('navigates to the next step when validation passes', () => {
      page.submit({
        capacities: [
          ['1', '2', '3'],
          ['1', '2', '3'],
          ['1', '2', '3'],
          ['1', '2', '3'],
        ],
      })

      Page.verifyOnPage(CreateCellsUsedForPage)
    })

    it('has a back link to the previous step', () => {
      page.backLink().click()

      Page.verifyOnPage(CreateCellsDoorNumbersPage)
    })

    it('has a cancel link to the view location show page', () => {
      page.cancelLink().click()

      Page.verifyOnPage(ViewLocationsShowPage)
    })
  })
})
