import Page, { PageElement } from '../page'

export default class SetCellTypeSpecialPage extends Page {
  constructor() {
    super('Select special cell type')
  }

  cellTypeRadio = (value: string): PageElement =>
    cy.get(`input[name="set-cell-type_specialistCellTypes"][type="radio"][value="${value}"]`)

  submitButton = (): PageElement => cy.get('button:contains("Save cell type")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')

  submit = ({ type }: { type?: string }) => {
    if (type) {
      this.cellTypeRadio(type).click()
    }

    this.submitButton().click()
  }
}
