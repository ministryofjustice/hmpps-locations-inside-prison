import CertChangeDisclaimerPage from '../../../pages/commonTransactions/certChangeDisclaimer'
import { Location } from '../../../../server/data/types/locationsApi'
import capFirst from '../../../../server/formatters/capFirst'

export default function goToCertChangeDisclaimer(location: Location) {
  cy.signIn()
  cy.visit(`/reactivate/location/${location.id}/`)
  return new CertChangeDisclaimerPage(`${capFirst(location.locationType.toLowerCase())} activation`)
}
