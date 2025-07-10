import Page, { PageElement } from '../../page'

export default class ResiStatusConfirmPage extends Page {
  constructor() {
    super('Update residential location status')
  }

  checkOnPage() {
    super.checkOnPage()
    cy.get('.govuk-heading-l').contains('Update residential location status')
    cy.get('.govuk-summary-list__key').eq(0).contains('Prison')
    cy.get('.govuk-summary-list__value').eq(0).contains('TST')
    cy.get('.govuk-summary-list__key').eq(1).contains('Residential location')
  }

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to prison configuration details")')

  confirmButton = (value: string): PageElement => cy.get(`button:contains("${value} residential location")`)
}
