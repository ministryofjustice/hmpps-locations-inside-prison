import { Location } from '../../../../server/data/types/locationsApi'
import Page from '../../../pages/page'
import NoCertChangeConfirmPage from '../../../pages/reactivate/location/noCertChangeConfirm'
import paths from '../../../../server/utils/paths'

export default function goToNoCertChangeConfirm(location: Location) {
  cy.signIn()
  cy.visit(paths.location.reactivate.location(location))

  return Page.verifyOnPage(NoCertChangeConfirmPage)
}
