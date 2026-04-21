import Page from '../../../../pages/page'
import ViewLocationsShowPage from '../../../../pages/viewLocations/show'
import CertChangeDisclaimerPage from '../../../../pages/commonTransactions/certChangeDisclaimer'
import { setupStubs, location } from './setupStubs'
import CheckCapacityPage from '../../../../pages/reactivate/location/checkCapacity'
import goToCheckCapacity from '../goToCheckCapacity'
import EditCapacityPage from '../../../../pages/reactivate/location/editCapacity'
import NoCertChangeConfirmPage from '../../../../pages/reactivate/location/noCertChangeConfirm'
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

    Page.verifyOnPage(ViewLocationsShowPage)
  })

  it('displays the correct details for the cells', () => {
    page.testCellsTable([
      ['A-1-001', '1', '1', '2', ['Accessible cell', 'Constant Supervision Cell']],
      ['A-1-002', '2', '2', '2', []],
      ['A-1-003', '1', '1', '2', []],
    ])
  })

  it('proceeds to cert change disclaimer on submit', () => {
    page.editCapacityLink(location.id).click()
    Page.verifyOnPage(EditCapacityPage).submit({ capacities: [['1', '2', '2']] })
    Page.verifyOnPage(CheckCapacityPage).submit()

    // eslint-disable-next-line no-new
    new CertChangeDisclaimerPage(`${capFirst(location.locationType.toLowerCase())} activation`)
  })

  context('when there are no cert changes', () => {
    it('proceeds to no cert change confirm on submit', () => {
      page.submit()

      Page.verifyOnPage(NoCertChangeConfirmPage)
    })
  })
})
