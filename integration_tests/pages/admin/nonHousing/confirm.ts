import Page, { PageElement } from '../../page'

export default class NonHousingConfirmPage extends Page {
  constructor() {
    super('Update NOMIS non housing checkboxes')
  }

  checkOnPage() {
    super.checkOnPage()
    cy.get('.govuk-heading-l').contains('Update NOMIS non housing checkboxes')
    cy.get('.govuk-summary-list__key').eq(0).contains('Prison')
    cy.get('.govuk-summary-list__value').eq(0).contains('TST')
    cy.get('.govuk-summary-list__key').eq(1).contains('Prison non housing checkboxes')
    cy.get('.govuk-summary-list__value').eq(1).contains('Enabled')
  }

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to prison configuration details")')

  confirmButton = (): PageElement => cy.get('button:contains("Disable non housing checkboxes")')
}
