import Page, { PageElement } from '../../page'

export default class ReactivateParentConfirmPage extends Page {
  constructor() {
    super('')
  }

  warningText = (): PageElement => cy.get('.govuk-warning-text__text')

  confirmButton = (): PageElement => cy.get('button:contains("Confirm activation")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')
}
