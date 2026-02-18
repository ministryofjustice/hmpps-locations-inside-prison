import Page, { PageElement } from '../../page'

export default class CheckCapacityPage extends Page {
  constructor() {
    super(/Check capacity of cells?/)
  }

  cellsTable = (): PageElement => cy.get('[data-qa=check-capacity-table]')

  cellsTableRows = (): PageElement => this.cellsTable().find('tbody tr')

  cellsTableCells = (row: PageElement) => {
    const children = row.children()

    return {
      location: children.eq(0),
      baselineCna: children.eq(1),
      workingCapacity: children.eq(2),
      maxCapacity: children.eq(3),
      cellTypes: children.eq(4),
    }
  }

  testCellsTable(rowText: [string, string, string, string, string[]][]) {
    this.cellsTableRows().should('have.length', rowText.length)

    this.cellsTableRows().each((row, i) => {
      const texts = rowText[i]
      const cells = this.cellsTableCells(row as unknown as PageElement)

      cy.wrap(cells.location).contains(texts[0])
      cy.wrap(cells.baselineCna).contains(texts[1])
      cy.wrap(cells.workingCapacity).contains(texts[2])
      cy.wrap(cells.maxCapacity).contains(texts[3])
      if (texts[4].length === 0) {
        cy.wrap(cells.cellTypes).contains('-')
      } else {
        texts[4].forEach(type => {
          cy.wrap(cells.cellTypes).contains(type)
        })
      }
    })
  }

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')

  submit = () => {
    this.continueButton().click()
  }
}
