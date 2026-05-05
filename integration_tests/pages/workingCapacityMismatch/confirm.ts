import Page, { PageElement } from '../page'

export default class WorkingCapacityMismatchConfirm extends Page {
  constructor() {
    super('Confirm cell capacity')
  }

  saveButton = (): PageElement => cy.get('button:contains("Update cell capacity")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')
}
