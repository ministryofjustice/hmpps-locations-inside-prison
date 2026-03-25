import Page from '../../../../pages/page'
import ViewLocationsShowPage from '../../../../pages/viewLocations/show'
import { setupStubs, location } from './setupStubs'
import CheckCapacityPage from '../../../../pages/reactivate/location/checkCapacity'
import goToCheckCapacity from '../goToCheckCapacity'
import EditCapacityPage from '../../../../pages/reactivate/location/editCapacity'
import SetCellTypeTypePage from '../../../../pages/setCellType/type'
import SetCellTypeSpecialPage from '../../../../pages/setCellType/special'

context('Certification Reactivation - Cell - Check capacity', () => {
  let page: CheckCapacityPage

  beforeEach(() => {
    setupStubs('MANAGE_RES_LOCATIONS_OP_CAP')

    page = goToCheckCapacity(location)
  })

  it('has a cancel link', () => {
    page.cancelLink().click()

    Page.verifyOnPage(ViewLocationsShowPage)
  })

  it('has a back link', () => {
    page.backLink().click()

    Page.verifyOnPage(ViewLocationsShowPage)
  })

  it('displays the correct details for the cell', () => {
    page.testCellsTable([['A-1-001', '1', '1', '2', ['Accessible cell', 'Constant Supervision Cell']]])
  })

  it('proceeds to check capacity on submit', () => {
    page.submit()

    Page.verifyOnPage(CheckCapacityPage)
  })

  context('when there is no working capacity change', () => {
    it('proceeds to no cert change confirm on submit', () => {
      page.editCapacityLink(location.id).click()
      Page.verifyOnPage(EditCapacityPage)
        .inputValues({ capacities: [['1', '0', '2']] })
        .setCellType(0)
        .click()
      Page.verifyOnPage(SetCellTypeTypePage).submit({ special: true })
      Page.verifyOnPage(SetCellTypeSpecialPage).submit({ type: 'BIOHAZARD_DIRTY_PROTEST' })
      Page.verifyOnPage(CheckCapacityPage).submit()
      Page.verifyOnPage(NoCertChangeConfirmPage)
    })
  })
})
