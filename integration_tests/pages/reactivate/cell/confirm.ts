import Page, { PageElement } from '../../page'

export default class ReactivateCellConfirmPage extends Page {
  constructor() {
    super('')
  }

  confirmButton = (): PageElement => cy.get('button:contains("Confirm activation")')

  changeLink = (): PageElement => cy.get('a:contains("Change")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')
}
