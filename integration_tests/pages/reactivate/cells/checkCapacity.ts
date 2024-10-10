import Page, { PageElement } from '../../page'

export default class ReactivateCellsCheckCapacityPage extends Page {
  constructor() {
    super('Check capacity of cells')
  }

  locationsTable = (): PageElement => cy.get('[data-qa=locations-table]')

  locationsTableRows = (): PageElement => this.locationsTable().find('tbody tr')

  locationsTableCells = (row: PageElement) => {
    const children = row.children()

    return {
      location: children.eq(0),
      workingCapacity: children.eq(1),
      maximumCapacity: children.eq(2),
      action: children.eq(3),
    }
  }

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')
}
