import { Location } from '../../../../server/data/types/locationsApi'
import Page from '../../../pages/page'
import CheckCapacityPage from '../../../pages/reactivate/location/checkCapacity'
import paths from '../../../../server/utils/paths'

export default function goToCheckCapacity(location: Location) {
  cy.signIn()
  cy.visit(paths.location.reactivate.location(location))

  return Page.verifyOnPage(CheckCapacityPage)
}
