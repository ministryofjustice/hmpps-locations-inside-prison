import Page, { PageElement } from '../page'

export default class PrisonConfigurationIndexPage extends Page {
  constructor() {
    super('Prison configuration')
  }

  static goTo = (prisonId: string) => cy.visit(`/admin/${prisonId}`)

  checkOnPage(): void {
    super.checkOnPage()
    cy.get('.govuk-heading-l').contains('Prison configuration')
    cy.get('.govuk-summary-list__key').eq(0).contains('Prison')
    cy.get('.govuk-summary-list__value').eq(0).contains('TST')
    cy.get('.govuk-summary-list__key').eq(1).contains('Residential location')
    cy.get('.govuk-summary-list__key').eq(2).contains('Include seg in roll count')
    cy.get('.govuk-summary-list__value').eq(2).contains('INACTIVE')
    cy.get('.govuk-summary-list__key').eq(3).contains('Certification approval required')
    cy.get('.govuk-summary-list__value').eq(3).contains('INACTIVE')
    cy.get('.govuk-summary-list__key').eq(4).contains('Prison non housing checkboxes')
    cy.get('.govuk-summary-list__key').eq(5).contains('OIDCHOLO screen blocked')
    cy.get('.govuk-summary-list__value').eq(5).contains('Not-Blocked')
  }

  changeResiLink = (): PageElement => cy.get('.govuk-summary-list__actions').eq(0).contains('Change')

  changeCertificationLink = (): PageElement => cy.get('.govuk-summary-list__actions').eq(1).contains('Change')

  changePrisonNonHousing = (): PageElement => cy.get('.govuk-summary-list__actions').eq(2).contains('Change')
}
