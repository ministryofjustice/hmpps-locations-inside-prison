import Page, { PageElement } from '../../page'

export default class CellConversionCertFlowSanitationPage extends Page {
  constructor() {
    super('Convert to cell')
  }

  checkOnPage(): void {
    super.checkOnPage()
    cy.get('h2').contains('Does the cell have in-cell sanitation?')
  }

  radioButton = (value: string): PageElement => cy.get(`input[name="inCellSanitation"][value="${value}"]`)

  submit = ({ inCellSanitation }: { inCellSanitation?: boolean }) => {
    if (inCellSanitation !== undefined) {
      this.radioButton(inCellSanitation ? 'YES' : 'NO').click()
    }

    this.continueButton().click()
  }

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')
}
