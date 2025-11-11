import Page, { PageElement } from '../../page'

export default class NonResiStatusConfirmPage extends Page {
  constructor() {
    super('Update non-residential locations status')
  }

  checkOnPage() {
    super.checkOnPage()
    cy.get('.govuk-heading-l').contains('Update non-residential locations status')
    cy.get('.govuk-summary-list__key').eq(0).contains('Prison')
    cy.get('.govuk-summary-list__value').eq(0).contains('TST')
    cy.get('.govuk-summary-list__key').eq(1).contains('Non-residential locations')
  }

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to prison configuration details")')

  confirmButton = (value: string): PageElement => cy.get(`button:contains("${value} non-residential locations")`)
}
