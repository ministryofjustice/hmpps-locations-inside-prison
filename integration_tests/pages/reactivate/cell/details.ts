import Page, { PageElement } from '../../page'

export default class ReactivateCellDetailsPage extends Page {
  constructor() {
    super('Check cell capacity')
  }

  static goTo = (locationId: string) => cy.visit(`/reactivate/cell/${locationId}`)

  workingCapacityInput = (): PageElement => cy.get('#workingCapacity')

  maxCapacityInput = (): PageElement => cy.get('#maxCapacity')

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')
}
