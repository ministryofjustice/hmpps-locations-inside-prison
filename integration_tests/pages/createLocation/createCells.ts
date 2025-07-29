import Page, { PageElement } from '../page'

export default class CreateCellsPage extends Page {
  constructor() {
    super(/Enter cell details/)
  }

  cellsToCreateInput = (): PageElement => cy.get('#create-cells_cellsToCreate')

  accommodationTypeRadios = (value: string): PageElement =>
    cy.get(`input[name="create-cells_accommodationType"][type="radio"][value="${value}"]`)

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')
}
