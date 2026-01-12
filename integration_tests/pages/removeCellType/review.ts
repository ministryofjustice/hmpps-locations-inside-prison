import Page, { PageElement } from '../page'

export default class ReviewCellCapacityPage extends Page {
  constructor() {
    super('Review cell capacity')
  }

  cnaInput = (): PageElement => cy.get('#baselineCna')

  workingCapacityInput = (): PageElement => cy.get('#workingCapacity')

  maxCapacityInput = (): PageElement => cy.get('#maxCapacity')

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  updateButton = (): PageElement => cy.get('button:contains("Update cell")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')
}
