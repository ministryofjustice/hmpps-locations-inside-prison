import Page, { PageElement } from '../page'

export default class SetCellTypePage extends Page {
  constructor() {
    super(/(Set|Change) specific cell type/)
  }

  static goTo = (locationId: string) => cy.visit(`/location/${locationId}/set-cell-type`)

  cellTypeCheckboxLabels = (): PageElement => cy.get('body').find('label.govuk-checkboxes__label')

  cellTypeCheckboxHints = (): PageElement => cy.get('body').find('.govuk-checkboxes__hint')

  cellTypeCheckbox = (value: string): PageElement =>
    cy.get(`input[name="specialistCellTypes"][type="checkbox"][value="${value}"]`)

  saveCellTypeButton = (): PageElement => cy.get('button:contains("Save cell type")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')
}
