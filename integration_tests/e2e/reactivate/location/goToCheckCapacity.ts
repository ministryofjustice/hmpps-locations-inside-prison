import { Location } from '../../../../server/data/types/locationsApi'
import Page from '../../../pages/page'
import CheckCapacityPage from '../../../pages/reactivate/location/checkCapacity'

export default function goToCheckCapacity(location: Location) {
  cy.signIn()
  cy.visit(`/reactivate/location/${location.id}/`)

  return Page.verifyOnPage(CheckCapacityPage)
}
