import Page, { PageElement } from '../../page'

export default class CreateCellsUsedForPage extends Page {
  constructor() {
    super('What are the cells used for?')
  }

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')
}
