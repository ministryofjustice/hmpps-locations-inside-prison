import Page, { PageElement } from '../../page'

export default class CreateCellsBulkSanitationPage extends Page {
  constructor() {
    super('Do all cells have in-cell sanitation?')
  }

  radio = (value: string): PageElement =>
    cy.get(`input[name="create-cells_bulkSanitation"][type="radio"][value="${value}"]`)

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')

  submit = ({ bulkSanitation }: { bulkSanitation?: boolean }) => {
    if (bulkSanitation !== undefined) {
      this.radio(bulkSanitation ? 'YES' : 'NO').click()
    }

    this.continueButton().click()
  }
}
