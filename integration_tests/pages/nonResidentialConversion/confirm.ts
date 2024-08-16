import Page, { PageElement } from '../page'

export default class NonResidentialConversionConfirmPage extends Page {
  constructor() {
    super('Confirm conversion to non-residential room')
  }

  confirmButton = (): PageElement => cy.get('button:contains("Confirm conversion")')

  changeLink = (): PageElement => cy.get('a:contains("Change")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')
}
