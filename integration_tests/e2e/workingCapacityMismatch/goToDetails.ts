import Page from '../../pages/page'
import WorkingCapacityMismatchDetails from '../../pages/workingCapacityMismatch/details'
import { cell } from './setupStubs'

export default function goToDetails() {
  cy.signIn()
  cy.visit(`/location/${cell.id}/working-capacity-mismatch`)

  return Page.verifyOnPage(WorkingCapacityMismatchDetails)
}
