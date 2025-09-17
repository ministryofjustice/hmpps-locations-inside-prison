import Page, { PageElement } from '../../page'

export default class CreateCellsTypesSpecialPage extends Page {
  constructor() {
    super(/Select special cell type/)
  }

  cellTypeRadios = (value: string): PageElement => {
    return cy.get(`input[name^="create-cells_set-cell-type_specialistCellTypes"][type="radio"][value="${value}"]`)
  }

  saveButton = (): PageElement => cy.get('button:contains("Save cell type")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')

  submit = ({ cellType }: { cellType?: string }) => {
    if (cellType) {
      this.cellTypeRadios(cellType).click()
    }

    this.saveButton().click()
  }
}
