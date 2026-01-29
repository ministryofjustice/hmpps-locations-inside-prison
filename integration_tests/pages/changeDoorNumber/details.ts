import Page, { PageElement } from '../page'

export default class ChangeDoorNumberPage extends Page {
  constructor() {
    super('Change door number')
  }

  doorNumberInput = (): PageElement => cy.get('#doorNumber')

  explanationInput = (): PageElement => cy.get('#explanation')

  confirmButton = (): PageElement => cy.get(`button:contains('Continue'), button:contains('Save door number')`)

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')

  submit = ({ doorNumber, explanation }: { doorNumber?: string; explanation?: string } = {}) => {
    this.doorNumberInput().clear()
    if (doorNumber) {
      this.doorNumberInput().type(doorNumber)
    }
    if (explanation) {
      this.explanationInput().clear()
      this.explanationInput().type(explanation)
    }
    this.confirmButton().click()
  }
}
