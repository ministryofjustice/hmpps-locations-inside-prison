import Page, { PageElement } from '../page'

export default class ChangeDoorNumberPage extends Page {
  constructor() {
    super('Change door number')
  }

  doorNumberInput = (): PageElement => cy.get('#doorNumber')

  confirmButton = (): PageElement => cy.get(`button:contains('Save door number')`)

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')

  submit = ({ doorNumber }: { doorNumber?: string }) => {
    this.doorNumberInput().clear()
    if (doorNumber) {
      this.doorNumberInput().type(doorNumber)
    }
    this.confirmButton().click()
  }
}
