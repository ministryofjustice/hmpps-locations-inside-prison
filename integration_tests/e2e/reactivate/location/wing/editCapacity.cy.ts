import Page from '../../../../pages/page'
import ViewLocationsShowPage from '../../../../pages/viewLocations/show'
import { setupStubs, location, landing2 } from './setupStubs'
import CheckCapacityPage from '../../../../pages/reactivate/location/checkCapacity'
import EditCapacityPage from '../../../../pages/reactivate/location/editCapacity'
import SetCellTypeTypePage from '../../../../pages/setCellType/type'
import SetCellTypeSpecialPage from '../../../../pages/setCellType/special'
import goToEditCapacity from '../goToEditCapacity'

context('Certification Reactivation - Wing - Edit capacity', () => {
  let page: EditCapacityPage

  beforeEach(() => {
    setupStubs('MANAGE_RES_LOCATIONS_OP_CAP')

    page = goToEditCapacity(location, landing2)
  })

  it('has a cancel link', () => {
    page.cancelLink().click()

    Page.verifyOnPage(ViewLocationsShowPage)
  })

  it('has a back link', () => {
    page.backLink().click()

    Page.verifyOnPage(CheckCapacityPage)
  })

  it('displays the correct errors', () => {
    // required
    page.submit({ capacities: [['', '', '']] })
    Page.checkForError('baselineCna-7e570000-0000-000a-0001-000000000121', 'Enter a baseline CNA', 'A-2-001: ')
    Page.checkForError('workingCapacity-7e570000-0000-000a-0001-000000000121', 'Enter a working capacity', 'A-2-001: ')
    Page.checkForError('maximumCapacity-7e570000-0000-000a-0001-000000000121', 'Enter a maximum capacity', 'A-2-001: ')

    // must be a number
    page.submit({ capacities: [['a', 'b', 'c']] })
    Page.checkForError('baselineCna-7e570000-0000-000a-0001-000000000121', 'Baseline CNA must be a number', 'A-2-001: ')
    Page.checkForError(
      'workingCapacity-7e570000-0000-000a-0001-000000000121',
      'Working capacity must be a number',
      'A-2-001: ',
    )
    Page.checkForError(
      'maximumCapacity-7e570000-0000-000a-0001-000000000121',
      'Maximum capacity must be a number',
      'A-2-001: ',
    )

    // must be positive
    page.submit({ capacities: [['-1', '-2', '-3']] })
    Page.checkForError('baselineCna-7e570000-0000-000a-0001-000000000121', 'Baseline CNA must be a number', 'A-2-001: ')
    Page.checkForError(
      'workingCapacity-7e570000-0000-000a-0001-000000000121',
      'Working capacity must be a number',
      'A-2-001: ',
    )
    Page.checkForError(
      'maximumCapacity-7e570000-0000-000a-0001-000000000121',
      'Maximum capacity must be a number',
      'A-2-001: ',
    )

    // working + cna must be less than or equal to maximum
    page.submit({ capacities: [['3', '3', '2']] })
    Page.checkForError(
      'baselineCna-7e570000-0000-000a-0001-000000000121',
      'Baseline CNA cannot be more than the maximum capacity',
      'A-2-001: ',
    )
    Page.checkForError(
      'workingCapacity-7e570000-0000-000a-0001-000000000121',
      'Working capacity cannot be more than the maximum capacity',
      'A-2-001: ',
    )

    // working + cna not be 0 for non-special cell type
    page.submit({ capacities: [['0', '0', '2']] })
    Page.checkForError(
      'baselineCna-7e570000-0000-000a-0001-000000000121',
      'Baseline CNA cannot be 0 for a normal accommodation cell',
      'A-2-001: ',
    )
    Page.checkForError(
      'workingCapacity-7e570000-0000-000a-0001-000000000121',
      'Working capacity cannot be 0 for a normal accommodation cell',
      'A-2-001: ',
    )
  })

  it('displays the correct values for the cells, initially and when changing types and proceeds to check capacity and retains the updated values on submit', () => {
    // Check initial values
    page.testValues({
      values: [
        ['1', '1', '2', ['Accessible cell', 'Constant Supervision Cell']],
        ['1', '1', '2', ['Add']],
      ],
    })

    // Change capacity values and remove cell types
    page.inputValues({
      capacities: [
        ['2', '2', '3'],
        ['1', '1', '2'],
      ],
    })
    page.removeCellType(0).click()
    Page.verifyOnPage(EditCapacityPage)
    page.testValues({
      values: [
        ['2', '2', '3', ['Add']],
        ['1', '1', '2', ['Add']],
      ],
    })

    // Set capacity values to 0 and add a special cell type
    page.inputValues({
      capacities: [
        ['0', '0', '2'],
        ['2', '2', '2'],
      ],
    })
    page.setCellType(0).click()
    Page.verifyOnPage(SetCellTypeTypePage).submit({ special: true })
    Page.verifyOnPage(SetCellTypeSpecialPage).submit({ type: 'BIOHAZARD_DIRTY_PROTEST' })
    Page.verifyOnPage(EditCapacityPage)
    page.testValues({
      values: [
        ['0', '0', '2', ['Biohazard / dirty protest cell']],
        ['2', '2', '2', ['Add']],
      ],
    })
    page.submit({ capacities: [] })

    const checkCapacityPage = Page.verifyOnPage(CheckCapacityPage)
    checkCapacityPage.testCellsTable([
      ['A-1-001', '1', '1', '2', ['Accessible cell', 'Constant Supervision Cell']],
      ['A-1-002', '1', '1', '2', ['-']],
      ['A-2-001', '0', '0', '2', ['Biohazard / dirty protest cell']],
      ['A-2-002', '2', '2', '2', ['-']],
    ])
  })
})
