import Page, { PageElement } from '../page'

export default class ArchivedLocationsIndexPage extends Page {
  constructor() {
    super('Archived locations')
  }

  locationsTable = (): PageElement => cy.get('[data-qa=archived-locations-table]')

  locationsTableRows = (): PageElement => this.locationsTable().find('tbody tr')

  locationsTableCells = (row: PageElement) => {
    const children = row.children()

    return {
      location: children.eq(0),
      locationType: children.eq(1),
      deactivatedBy: children.eq(2),
    }
  }
}
