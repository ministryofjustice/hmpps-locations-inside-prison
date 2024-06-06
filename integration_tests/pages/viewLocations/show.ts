import Page, { PageElement } from '../page'

export default class ViewLocationsShowPage extends Page {
  constructor() {
    super('')
  }

  breadcrumbs = (): PageElement => cy.get('.govuk-breadcrumbs__link')

  locationType = (): PageElement => cy.get('[data-qa=location-type]')

  certifiedTag = (): PageElement => cy.get('[data-qa=certified-tag]')

  statusTag = (): PageElement => cy.get('[data-qa=status-tag]')

  inactiveBanner = (): PageElement => cy.get('[data-qa=inactive-location-banner]')

  inactiveBannerRows = (): PageElement => this.inactiveBanner().find('.govuk-summary-list__row')

  summaryCards = {
    all: (): PageElement => cy.get('.hmpps-summary-card'),
    workingCapacityText: (): PageElement =>
      cy.get('[data-qa=working-capacity-card]').find('[data-qa=bottom-content-line-1]'),
    maximumCapacityText: (): PageElement =>
      cy.get('[data-qa=maximum-capacity-card]').find('[data-qa=bottom-content-line-1]'),
    inactiveCells: (): PageElement => cy.get('[data-qa=inactive-cells-card]'),
    inactiveCellsText: (): PageElement => this.summaryCards.inactiveCells().find('[data-qa=bottom-content-line-1]'),
    inactiveCellsViewLink: (): PageElement => this.summaryCards.inactiveCells().find('a'),
  }

  locationDetails = (): PageElement => cy.get('[data-qa=location-details]')

  locationDetailsRows = (): PageElement => this.locationDetails().find('.govuk-summary-list__row')

  locationsTable = (): PageElement => cy.get('[data-qa=locations-table]')

  locationsHeader = (): PageElement => this.locationsTable().find('caption')

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
