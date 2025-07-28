import Page, { PageElement } from '../page'

export default class CreateLocationDetailsPage extends Page {
  constructor() {
    super(/Enter \w+ details/)
  }

  static goTo = (locationId: string) => cy.visit(`/create-new/${locationId}/details`)

  localNameTextInput = (): PageElement => cy.get('#localName')

  locationCodeInput = (): PageElement => cy.get('#locationCode')

  createCellsNowRadio = (value: string): PageElement =>
    cy.get(`input[name="createCellsNow"][type="radio"][value="${value}"]`)

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')
}
