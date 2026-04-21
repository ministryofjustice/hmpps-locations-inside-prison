import Page, { PageElement } from '../../page'

export default class NoCertChangeConfirmPage extends Page {
  constructor() {
    super(/You are about to reactivate \d+ cells?/)
  }

  warningText = (): PageElement => cy.get('.govuk-warning-text__text')

  confirmButton = (): PageElement => cy.get('button:contains("Confirm activation")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')
}
