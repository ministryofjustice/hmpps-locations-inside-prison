import Page, { PageElement } from '../../page'

export default class CreateCellsTypesPage extends Page {
  constructor() {
    super(/Is it a normal or special cell type\?/)
  }

  normalAccommodationType = (): PageElement =>
    cy.get('input[name^=create-cells_set-cell-type_accommodationType][value=NORMAL_ACCOMMODATION]')

  specialAccommodationType = (): PageElement =>
    cy.get('input[name^=create-cells_set-cell-type_accommodationType][value=SPECIAL_ACCOMMODATION]')

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')
}
