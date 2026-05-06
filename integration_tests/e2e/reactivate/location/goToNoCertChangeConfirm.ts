import { Location } from '../../../../server/data/types/locationsApi'
import Page from '../../../pages/page'
import NoCertChangeConfirmPage from '../../../pages/reactivate/location/noCertChangeConfirm'

export default function goToNoCertChangeConfirm(location: Location) {
  cy.signIn()
  cy.visit(`/reactivate/location/${location.id}/`)

  return Page.verifyOnPage(NoCertChangeConfirmPage)
}
