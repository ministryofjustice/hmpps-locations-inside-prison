import Page, { PageElement } from '../../page'

export default class CertApprovalConfirmPage extends Page {
  constructor() {
    super('Update certification approval status')
  }

  checkOnPage() {
    super.checkOnPage()
    cy.get('.govuk-heading-l').contains('Update certification approval status')
    cy.get('.govuk-summary-list__key').eq(0).contains('Prison')
    cy.get('.govuk-summary-list__value').eq(0).contains('TST')
    cy.get('.govuk-summary-list__key').eq(1).contains('Certification approval required')
    cy.get('.govuk-summary-list__value').eq(1).contains('INACTIVE')
  }

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to prison configuration details")')

  confirmButton = (): PageElement => cy.get('button:contains("Activate certification approval")')
}
