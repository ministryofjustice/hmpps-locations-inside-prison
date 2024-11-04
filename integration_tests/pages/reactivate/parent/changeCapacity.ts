import Page, { PageElement } from '../../page'

export default class ReactivateParentChangeCapacityPage extends Page {
  constructor() {
    super('Change cell capacity')
  }

  workingCapacityInput = (): PageElement => cy.get('#workingCapacity')

  maxCapacityInput = (): PageElement => cy.get('#maxCapacity')

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')
}
