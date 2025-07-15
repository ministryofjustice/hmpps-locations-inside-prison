import Page, { PageElement } from '../page'

export default class ViewLocationsIndexPage extends Page {
  constructor() {
    super('')
    this.checkOnPage()
  }

  checkOnPage() {
    cy.location('pathname').should('contain', '/view-and-update-locations/')
  }

  capacity = {
    working: (): PageElement => cy.get('[data-qa=working-capacity-card]').find('[data-qa=bottom-content-line-1]'),
    signedOperational: (): PageElement =>
      cy.get('[data-qa=signed-operational-capacity-card]').find('[data-qa=bottom-content-line-1]'),
    signedOperationalChangeLink: (): PageElement =>
      cy.get('[data-qa=signed-operational-capacity-card]').find('.hmpps-mini-card__link a'),
    maximum: (): PageElement => cy.get('[data-qa=maximum-capacity-card]').find('[data-qa=bottom-content-line-1]'),
  }

  locationsCreateButton = (): PageElement => cy.get('[data-qa=create-button]')

  locationsTable = (): PageElement => cy.get('[data-qa=locations-table]')

  locationsHeader = (): PageElement => cy.get('[data-qa=locations-table-caption]')

  locationsTableRows = (): PageElement => this.locationsTable().find('tbody tr')

  locationsTableCells = (row: PageElement) => {
    const children = row.children()

    return {
      location: children.eq(0),
      status: children.eq(1),
      workingCapacity: children.eq(2),
      maximumCapacity: children.eq(3),
      inactiveCells: children.eq(4),
      accommodationType: children.eq(5),
      usedFor: children.eq(6),
    }
  }
}
