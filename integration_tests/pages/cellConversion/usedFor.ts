import Page, { PageElement } from '../page'

export default class CellConversionUsedForPage extends Page {
  constructor() {
    super('Convert to cell')
  }

  checkOnPage(): void {
    super.checkOnPage()
    cy.get('legend').contains('What is the location used for?')
  }

  usedForCheckboxLabels = (): PageElement => cy.get('body').find('label.govuk-checkboxes__label')

  usedForCheckboxItem = (value: string): PageElement =>
    cy.get(`input[name="usedForTypes"][type="checkbox"][value="${value}"]`)

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')
}
