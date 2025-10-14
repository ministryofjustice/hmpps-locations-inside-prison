import Page, { PageElement } from '../../page'

export default class UpdateSignedOpCapDetailsPage extends Page {
  constructor() {
    super('Update the signed operational capacity')
  }

  opCapInput = (): PageElement => cy.get(`input[name$="newSignedOpCap"]`)

  explanationInput = (): PageElement => cy.get(`textarea[name$="explanation"]`)

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')

  submit = ({ opCap, explanation }: { opCap?: number; explanation?: string }) => {
    this.opCapInput().clear()
    if (opCap !== undefined) {
      this.opCapInput().type(opCap.toString())
    }

    this.explanationInput().clear()
    if (explanation !== undefined) {
      this.explanationInput().type(explanation)
    }

    this.continueButton().click()
  }
}
