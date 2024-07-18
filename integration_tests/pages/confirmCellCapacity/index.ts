import Page, { PageElement } from '../page'

export default class ConfirmCellCapacityPage extends Page {
  constructor() {
    super('Confirm cell capacity')
  }

  updateCellCapacityButton = (): PageElement => cy.get('button:contains("Update cell capacity")')

  changeLink = (): PageElement => cy.get('a:contains("Change")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')
}
