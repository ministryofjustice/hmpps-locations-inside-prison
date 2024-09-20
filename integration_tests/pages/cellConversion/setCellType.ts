import Page, { PageElement } from '../page'

export default class CellConversionSetCellTypePage extends Page {
  constructor() {
    super('Convert to cell')
  }

  checkOnPage(): void {
    super.checkOnPage()
    cy.get('legend').contains('Set specific cell type')
  }

  cellTypeCheckboxLabels = (): PageElement => cy.get('body').find('label.govuk-checkboxes__label')

  cellTypeCheckboxHints = (): PageElement => cy.get('body').find('.govuk-checkboxes__hint')

  cellTypeCheckboxItem = (value: string): PageElement =>
    cy.get(`input[name="specialistCellTypes"][type="checkbox"][value="${value}"]`)

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')
}
