import Page, { PageElement } from '../page'

export default class ChangeCellCapacityPage extends Page {
  constructor() {
    super('')
  }

  static goTo = (locationId: string) => cy.visit(`/location/${locationId}/change-cell-capacity`)

  cnaInput = (): PageElement => cy.get('#baselineCna')

  workingCapacityInput = (): PageElement => cy.get('#workingCapacity')

  maxCapacityInput = (): PageElement => cy.get('#maxCapacity')

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  saveButton = (): PageElement => cy.get('button:contains("Save cell capacity")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')
}
