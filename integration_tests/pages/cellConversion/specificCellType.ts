import Page, { PageElement } from '../page'

export default class CellConversionSpecificCellTypePage extends Page {
  constructor() {
    super('Convert to cell')
  }

  checkOnPage(): void {
    super.checkOnPage()
    cy.get('legend').contains('Is it a specific type of cell?')
  }

  noRadioButton = (): PageElement => cy.get(`input[name="hasSpecificCellType"][type="radio"][value="no"]`)

  yesRadioButton = (): PageElement => cy.get(`input[name="hasSpecificCellType"][type="radio"][value="yes"]`)

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')
}
