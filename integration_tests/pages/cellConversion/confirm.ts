import Page, { PageElement } from '../page'

export default class CellConversionConfirmPage extends Page {
  constructor() {
    super('Confirm conversion to cell')
  }

  confirmConversionButton = (): PageElement => cy.get('button:contains("Confirm conversion")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')

  changeAccommodationTypeLink = (): PageElement =>
    cy.get('.govuk-summary-list__row:contains("Accommodation type")').find('a:contains("Change")')

  changeUsedForTypesLink = (): PageElement =>
    cy.get('.govuk-summary-list__row:contains("Used for")').find('a:contains("Change")')

  changeCellTypesLink = (): PageElement =>
    cy.get('.govuk-summary-list__row:contains("Cell type")').find('a:contains("Change")')

  changeWorkingCapacityLink = (): PageElement =>
    cy.get('.govuk-summary-list__row:contains("Working capacity")').find('a:contains("Change")')

  changeMaxCapacityLink = (): PageElement =>
    cy.get('.govuk-summary-list__row:contains("Maximum capacity")').find('a:contains("Change")')
}
