import Page, { PageElement } from '../../page'
import paths from '../../../../server/utils/paths'

export default class ReactivateCellDetailsPage extends Page {
  constructor() {
    super('')
  }

  static goTo = (locationId: string) => cy.visit(paths.location.reactivate.cell('TST', locationId))

  workingCapacityInput = (): PageElement => cy.get('#workingCapacity')

  maxCapacityInput = (): PageElement => cy.get('#maxCapacity')

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')
}
