import Page, { PageElement } from '../page'

export default class ChangeDoorNumberPage extends Page {
  constructor() {
    super('Does the cell have in-cell sanitation?')
  }

  radio = (value: string): PageElement => cy.get(`input[name="inCellSanitation"][type="radio"][value="${value}"]`)

  confirmButton = (): PageElement => cy.get(`button:contains('Save sanitation')`)

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')

  submit = ({ inCellSanitation }: { inCellSanitation?: boolean }) => {
    if (inCellSanitation !== undefined) {
      this.radio(inCellSanitation ? 'YES' : 'NO').click()
    }

    this.confirmButton().click()
  }
}
