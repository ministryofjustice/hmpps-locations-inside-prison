import Page, { PageElement } from '../../page'

export default class CreateCellsWithoutSanitationPage extends Page {
  constructor() {
    super('Select any cells without in-cell sanitation')
  }

  withoutSanitationInput = (index: number): PageElement =>
    cy.get(`input[name="create-cells_withoutSanitation"][value="${index}"]`)

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')

  submit = ({ withoutSanitation }: { withoutSanitation: number[] }) => {
    cy.get('input[name="create-cells_withoutSanitation"]').uncheck()

    withoutSanitation.forEach(i => {
      this.withoutSanitationInput(i).check()
    })

    this.continueButton().click()
  }
}
