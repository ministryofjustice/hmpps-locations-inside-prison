import Page, { PageElement } from '../../page'

export default class ReactivateParentSelectPage extends Page {
  constructor() {
    super('')
  }

  confirmButton = (): PageElement => cy.get('button:contains("Confirm activation")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')
}
