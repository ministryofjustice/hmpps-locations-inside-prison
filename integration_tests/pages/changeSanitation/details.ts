import Page, { PageElement } from '../page'

export default class ChangeDoorNumberPage extends Page {
  constructor() {
    super('Does the cell have in-cell sanitation?')
  }

  radio = (value: string): PageElement => cy.get(`input[name="inCellSanitation"][type="radio"][value="${value}"]`)

  explanationInput = (): PageElement => cy.get('#explanation')

  confirmButton = (): PageElement => cy.get(`button:contains('Continue'), button:contains('Save sanitation')`)

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')

  submit = ({ inCellSanitation, explanation }: { inCellSanitation?: boolean; explanation?: string }) => {
    if (inCellSanitation !== undefined) {
      this.radio(inCellSanitation ? 'YES' : 'NO').click()
    }
    if (explanation) {
      this.explanationInput().clear()
      this.explanationInput().type(explanation)
    }
    this.confirmButton().click()
  }
}
