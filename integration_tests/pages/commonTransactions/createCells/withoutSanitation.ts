import Page, { PageElement } from '../../page'

export default class CreateCellsWithoutSanitationPage extends Page {
  constructor() {
    super('Select any cells without in-cell sanitation')
  }

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')

  submit = () => {
    this.continueButton().click()
  }
}
