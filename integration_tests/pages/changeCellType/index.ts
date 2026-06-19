import Page, { PageElement } from '../page'

export default class ChangeCellTypePage extends Page {
  constructor() {
    super(/Select (normal|special) cell type/)
  }

  static goTo = (locationId: string) => cy.visit(`/location/${locationId}/change-cell-type`)

  cellTypeCheckbox = (value: string): PageElement =>
    cy.get(`input[name="specialistCellTypes"][type="checkbox"][value="${value}"]`)

  cellTypeRadio = (value: string): PageElement =>
    cy.get(`input[name="specialistCellTypes"][type="radio"][value="${value}"]`)

  submitButton = (): PageElement => cy.get('button:contains("Save cell type")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')

  submitNormal = ({ types }: { types: string[] }) => {
    cy.get(`input[name="specialistCellTypes"]`).uncheck()

    types.forEach(type => {
      this.cellTypeCheckbox(type).click()
    })

    this.submitButton().click()
  }

  submitSpecial = (type: string) => {
    this.cellTypeRadio(type).click()
    this.submitButton().click()
  }
}
