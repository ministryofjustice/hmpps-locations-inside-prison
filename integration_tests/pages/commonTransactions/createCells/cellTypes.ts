import Page, { PageElement } from '../../page'

export default class CreateCellsTypesPage extends Page {
  constructor() {
    super(/Is it a normal or special cell type?/)
  }

  normalAccommodationType = (): PageElement => cy.get('#create-cells_set-cell-type_accommodationType0')

  specialAccommodationType = (): PageElement => cy.get('#create-cells_set-cell-type_accommodationType0-2')

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')
}
