import Page, { PageElement } from '../../page'

export default class CreateCellsBulkSanitationPage extends Page {
  constructor() {
    super('Do all cells have in-cell sanitation?')
  }

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')
}
