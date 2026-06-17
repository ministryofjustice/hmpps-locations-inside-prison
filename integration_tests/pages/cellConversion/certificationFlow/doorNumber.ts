import Page, { PageElement } from '../../page'

export default class CellConversionCertFlowDoorNumberPage extends Page {
  constructor() {
    super('Convert to cell')
  }

  checkOnPage(): void {
    super.checkOnPage()
    cy.get('h2').contains('cell door number')
  }

  doorNumberInput = (): PageElement => cy.get('input[name="doorNumber"]')

  submit = ({ doorNumber }: { doorNumber?: string }) => {
    this.doorNumberInput().clear()
    if (doorNumber !== undefined) {
      this.doorNumberInput().type(doorNumber)
    }

    this.continueButton().click()
  }

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')
}
