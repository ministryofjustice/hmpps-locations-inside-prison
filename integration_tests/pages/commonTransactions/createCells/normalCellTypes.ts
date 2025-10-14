import Page, { PageElement } from '../../page'

export default class CreateCellsTypesNormalPage extends Page {
  constructor() {
    super(/Select normal cell type/)
  }

  cellTypeCheckboxes = (value: string): PageElement => {
    return cy.get(`input[name^="create-cells_set-cell-type_normalCellTypes"][type="checkbox"][value="${value}"]`)
  }

  saveButton = (): PageElement => cy.get('button:contains("Save cell type")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')

  submit = ({ cellType }: { cellType?: string[] }) => {
    if (cellType && cellType.length > 0) {
      cellType.forEach(type => {
        this.cellTypeCheckboxes(type).click()
      })
    }

    this.saveButton().click()
  }
}
