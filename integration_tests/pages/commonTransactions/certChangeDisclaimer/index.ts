import Page, { PageElement } from '../../page'

export default class CertChangeDisclaimerPage extends Page {
  constructor(title: string) {
    super(`${title} requires a change to the cell certificate`)
  }

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')

  submit = () => {
    this.continueButton().click()
  }
}
