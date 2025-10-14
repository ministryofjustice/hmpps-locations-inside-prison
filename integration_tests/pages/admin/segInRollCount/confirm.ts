import Page, { PageElement } from '../../page'

export default class SegInRollCountConfirmPage extends Page {
  constructor() {
    super('Update include seg in roll count status')
  }

  checkOnPage() {
    super.checkOnPage()
    cy.get('.govuk-heading-l').contains('Update include seg in roll count status')
    cy.get('.govuk-summary-list__key').eq(0).contains('Prison')
    cy.get('.govuk-summary-list__value').eq(0).contains('TST')
    cy.get('.govuk-summary-list__key').eq(1).contains('Include seg in roll count')
    cy.get('.govuk-summary-list__value').eq(1).contains('INACTIVE')
  }

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to prison configuration details")')

  confirmButton = (): PageElement => cy.get('button:contains("Activate include seg in roll count")')
}
