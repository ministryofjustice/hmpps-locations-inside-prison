import Page, { PageElement } from '../page'

export default class ArchiveReasonPage extends Page {
  constructor() {
    super('Why is this location is being archived?')
  }

  reasonInput = (): PageElement => cy.get('#reason')

  confirmButton = (): PageElement => cy.get(`button:contains('Continue')`)

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')

  submit = (reason: string) => {
    this.reasonInput().clear()
    if (reason) this.reasonInput().type(reason)
    this.confirmButton().click()
  }
}
