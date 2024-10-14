import Page, { PageElement } from '../page'

export default class ViewLocationsShowPage extends Page {
  constructor() {
    super('')
    this.checkOnPage()
  }

  static goTo = (prisonId?: string, locationId?: string) =>
    cy.visit(`/view-and-update-locations/${[prisonId, locationId].join('/')}`)

  checkOnPage() {
    cy.location('pathname').should('contain', '/view-and-update-locations/')
  }

  breadcrumbs = (): PageElement => cy.get('.govuk-breadcrumbs__link')

  locationType = (): PageElement => cy.get('[data-qa=location-type]')

  certifiedTag = (): PageElement => cy.get('[data-qa=certified-tag]')

  statusTag = (): PageElement => cy.get('[data-qa=status-tag]')

  inactiveBanner = (): PageElement => cy.get('[data-qa=inactive-location-banner]')

  inactiveBannerRows = (): PageElement => this.inactiveBanner().find('.govuk-summary-list__row')

  inactiveBannerActivateCellButton = (): PageElement => this.inactiveBanner().get(`a:contains("Activate cell")`)

  actionsMenu = (): PageElement => cy.get('button.moj-button-menu__toggle-button')

  convertToNonResAction = (): PageElement =>
    cy.get('.moj-button-menu__wrapper a:contains("Convert to non-residential room")')

  convertToCellButton = (): PageElement => cy.get('.govuk-button:contains("Convert to cell")')

  deactivateAction = (): PageElement => cy.get('.moj-button-menu__wrapper a:contains("Deactivate cell")')

  summaryCards = {
    all: (): PageElement => cy.get('.hmpps-summary-card'),
    workingCapacityText: (): PageElement =>
      cy.get('[data-qa=working-capacity-card]').find('[data-qa=bottom-content-line-1]'),
    maximumCapacityText: (): PageElement =>
      cy.get('[data-qa=maximum-capacity-card]').find('[data-qa=bottom-content-line-1]'),
    workingCapacityChangeLink: (): PageElement =>
      cy.get('[data-qa=working-capacity-card]').find('.hmpps-mini-card__link a'),
    maximumCapacityChangeLink: (): PageElement =>
      cy.get('[data-qa=maximum-capacity-card]').find('.hmpps-mini-card__link a'),
    inactiveCells: (): PageElement => cy.get('[data-qa=inactive-cells-card]'),
    inactiveCellsText: (): PageElement => this.summaryCards.inactiveCells().find('[data-qa=bottom-content-line-1]'),
    inactiveCellsViewLink: (): PageElement => this.summaryCards.inactiveCells().find('a'),
  }

  locationDetails = (): PageElement => cy.get('[data-qa=location-details]')

  locationDetailsRows = (): PageElement => this.locationDetails().find('.govuk-summary-list__row')

  setSpecificCellTypeLink = (): PageElement => this.locationDetails().find('a:contains("Set specific cell type")')

  changeSpecificCellTypeLink = (): PageElement => this.locationDetailsRows().eq(1).find('a:contains("Change")')

  removeSpecificCellTypeLink = (): PageElement => this.locationDetailsRows().eq(1).find('a:contains("Remove")')

  localNameRow = (): PageElement => cy.get('dt.govuk-summary-list__key').contains('Local Name')

  setLocalNameLink = (): PageElement => this.locationDetailsRows().eq(1).find('a:contains("Add local name")')

  changeLocalNameLink = (): PageElement => this.locationDetailsRows().eq(1).find('a:contains("Change")')

  removeLocalNameLink = (): PageElement => this.locationDetailsRows().eq(1).find('a:contains("Remove")')

  cellUsedForDetails = (): PageElement =>
    this.locationDetailsRows().eq(3).find('.govuk-summary-list__value').contains('Test type')

  changeCellUsedForLink = (): PageElement => this.locationDetailsRows().eq(3).find('a:contains("Change")')

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
