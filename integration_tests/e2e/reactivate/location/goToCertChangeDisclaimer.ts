import CertChangeDisclaimerPage from '../../../pages/commonTransactions/certChangeDisclaimer'
import { Location } from '../../../../server/data/types/locationsApi'
import capFirst from '../../../../server/formatters/capFirst'
import goToCheckCapacity from './goToCheckCapacity'
import Page from '../../../pages/page'
import EditCapacityPage from '../../../pages/reactivate/location/editCapacity'
import CheckCapacityPage from '../../../pages/reactivate/location/checkCapacity'

export default function goToCertChangeDisclaimer(location: Location) {
  goToCheckCapacity(location)
  cy.get(`a[href*="/edit-capacity/"]`).first().click()
  const editCapacityPage = Page.verifyOnPage(EditCapacityPage)
  editCapacityPage.submit({ capacities: [['1', '2', '2']] })
  Page.verifyOnPage(CheckCapacityPage).submit()

  return new CertChangeDisclaimerPage(`${capFirst(location.locationType.toLowerCase())} activation`)
}
