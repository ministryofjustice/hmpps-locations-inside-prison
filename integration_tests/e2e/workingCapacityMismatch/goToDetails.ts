import Page from '../../pages/page'
import WorkingCapacityMismatchDetails from '../../pages/workingCapacityMismatch/details'
import { cell } from './setupStubs'
import paths from '../../../server/utils/paths'

export default function goToDetails() {
  cy.signIn()
  cy.visit(paths.location.workingCapacityMismatch(cell))

  return Page.verifyOnPage(WorkingCapacityMismatchDetails)
}
