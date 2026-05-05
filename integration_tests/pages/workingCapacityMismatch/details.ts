import Page, { PageElement } from '../page'

export default class WorkingCapacityMismatchDetails extends Page {
  constructor() {
    super('Cell’s working capacity does not match the cell certificate')
  }

  table = (): PageElement => cy.get('[data-qa=working-capacity-table]')

  tableRows = (): PageElement => this.table().find('tbody tr')

  tableCells = (row: PageElement) => {
    const children = row.children()

    return {
      type: children.eq(0),
      capacity: children.eq(1),
    }
  }

  testTable(rowText: [string, string][]) {
    this.tableRows().should('have.length', rowText.length)

    this.tableRows().each((row, i) => {
      const [type, capacity] = rowText[i]
      const cells = this.tableCells(row as unknown as PageElement)

      cy.wrap(cells.type).contains(type)
      cy.wrap(cells.capacity).contains(capacity)
    })
  }

  radio = (value: 'YES' | 'NO'): PageElement => cy.get(`input[name="certifiedChange"][type="radio"][value="${value}"]`)

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')

  submit = ({ certified }: { certified?: boolean }) => {
    if (certified !== undefined) {
      this.radio(certified ? 'YES' : 'NO').click()
    }

    this.continueButton().click()
  }
}
