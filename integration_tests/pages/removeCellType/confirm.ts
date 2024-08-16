import Page, { PageElement } from '../page'

export default class ConfirmRemoveCellTypePage extends Page {
  constructor() {
    super('Confirm cell type removal and capacity changes')
  }

  updateCellButton = (): PageElement => cy.get('button:contains("Update cell")')

  changeLink = (): PageElement => cy.get('a:contains("Change")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')
}
