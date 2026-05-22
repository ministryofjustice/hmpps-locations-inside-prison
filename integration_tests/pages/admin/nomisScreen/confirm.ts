import Page, { PageElement } from '../../page'

export default class NomisScreenStatusConfirmPage extends Page {
  constructor() {
    super('Update Maintain internal locations (OIMILOCA) status')
  }

  checkOnPage() {
    super.checkOnPage()
    cy.get('.govuk-summary-list__key').eq(1).contains('Screen')
    cy.get('.govuk-summary-list__key').eq(2).contains('Current status')
  }

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to prison configuration details")')

  radio = (value: string): PageElement => cy.get(`input[name="screenStatus"][value="${value}"]`)

  saveButton = (): PageElement => cy.get('button:contains("Save")')
}
