import Page, { PageElement } from '../page'

export default class ReviewCellCapacityPage extends Page {
  constructor() {
    super('Review cell capacity')
  }

  cnaInput = (): PageElement => cy.get('[id$="baselineCna"]')

  workingCapacityInput = (): PageElement => cy.get('[id$="workingCapacity"]')

  maxCapacityInput = (): PageElement => cy.get('[id$="maxCapacity"]')

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  updateButton = (): PageElement => cy.get('button:contains("Update cell")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')
}
