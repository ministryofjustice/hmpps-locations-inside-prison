import Page, { PageElement } from '../page'

export default class InactiveCellsIndexPage extends Page {
  constructor() {
    super('')
  }

  locationsTable = (): PageElement => cy.get('[data-qa=inactive-cells-table]')

  locationsTableRows = (): PageElement => this.locationsTable().find('tbody tr')

  getFirstRow = (): PageElement => cy.get('[data-qa=inactive-cells-table] .govuk-table__header > a')

  locationsTableCells = (row: PageElement) => {
    const children = row.children()

    return {
      location: children.eq(0),
      reason: children.eq(1),
      estimatedReactivationDate: children.eq(2),
      planetFmReference: children.eq(3),
      deactivatedBy: children.eq(4),
    }
  }
}
