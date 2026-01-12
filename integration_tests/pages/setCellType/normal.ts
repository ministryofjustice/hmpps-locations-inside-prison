import Page, { PageElement } from '../page'

export default class SetCellTypeNormalPage extends Page {
  constructor() {
    super('Select normal cell type')
  }

  cellTypeCheckbox = (value: string): PageElement =>
    cy.get(`input[name="set-cell-type_normalCellTypes"][type="checkbox"][value="${value}"]`)

  submitButton = (): PageElement => cy.get('button:contains("Save cell type")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')

  submit = ({ types }: { types: string[] }) => {
    cy.get(`input[name="set-cell-type_normalCellTypes"]`).uncheck()

    types.forEach(type => {
      this.cellTypeCheckbox(type).click()
    })

    this.submitButton().click()
  }
}
