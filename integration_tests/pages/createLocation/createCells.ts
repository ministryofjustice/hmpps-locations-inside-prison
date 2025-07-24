import Page, { PageElement } from '../page'

export default class CreateCellsPage extends Page {
  constructor() {
    super(/Enter cell details/)
  }

  static goTo = (locationId: string) => cy.visit(`/create-new/${locationId}/crate-cells`)

  cellsToCreateInput = (): PageElement => cy.get('#cellsToCreate')

  accommodationTypeRadios = (value: string): PageElement =>
    cy.get(`input[name="accommodationType"][type="radio"][value="${value}"]`)

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')
}
