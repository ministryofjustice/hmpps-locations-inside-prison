import Page, { PageElement } from '../../page'

export default class UpdateSignedOpCapAlreadyRequestedPage extends Page {
  constructor() {
    super('A change to the signed operational capacity has already been requested')
  }

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')

  submit = () => {
    this.continueButton().click()
  }
}
