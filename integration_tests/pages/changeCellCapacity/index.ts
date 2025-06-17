import Page, { PageElement } from '../page'

export default class ChangeCellCapacityPage extends Page {
  constructor() {
    super('')
  }

  static goTo = (locationId: string) => cy.visit(`/location/${locationId}/change-cell-capacity`)

  workingCapacityInput = (): PageElement => cy.get('#workingCapacity')

  maxCapacityInput = (): PageElement => cy.get('#maxCapacity')

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')
}
