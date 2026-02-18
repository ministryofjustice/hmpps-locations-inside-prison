import Page from '../../../../pages/page'
import ViewLocationsShowPage from '../../../../pages/viewLocations/show'
import CertChangeDisclaimerPage from '../../../../pages/commonTransactions/certChangeDisclaimer'
import { setupStubs, location } from './setupStubs'
import CheckCapacityPage from '../../../../pages/reactivate/location/checkCapacity'
import goToCheckCapacity from '../goToCheckCapacity'
import capFirst from '../../../../../server/formatters/capFirst'

context('Certification Reactivation - Landing - Check capacity', () => {
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

    // eslint-disable-next-line no-new
    new CertChangeDisclaimerPage(`${capFirst(location.locationType.toLowerCase())} activation`)
  })

  it('displays the correct details for the cells', () => {
    page.testCellsTable([
      ['A-1-001', '1', '1', '2', ['Accessible cell', 'Constant Supervision Cell']],
      ['A-1-002', '2', '2', '2', []],
      ['A-1-003', '1', '1', '2', []],
    ])
  })

  // it('proceeds to check capacity on submit', () => {
  //   page.submit()
  //
  //   Page.verifyOnPage(CheckCapacityPage)
  // })
})
