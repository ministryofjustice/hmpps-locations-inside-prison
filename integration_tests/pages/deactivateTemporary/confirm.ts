import Page, { PageElement } from '../page'

export default class DeactivateTemporaryConfirmPage extends Page {
  constructor() {
    super('Check your answers before deactivating this location')
  }

  confirmButton = (): PageElement => cy.get('button:contains("Confirm deactivation")')

  changeLink = (): PageElement => cy.get('a:contains("Change")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')
}
