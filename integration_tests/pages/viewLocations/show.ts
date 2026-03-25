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

  locationsCreateButton = (): PageElement => cy.get('[data-qa=create-button]')

  breadcrumbs = (): PageElement => cy.get('.govuk-breadcrumbs__link')

  locationType = (): PageElement => cy.get('[data-qa=location-type]')

  certifiedTag = (): PageElement => cy.get('[data-qa=certified-tag]')

  statusTag = (): PageElement => cy.get('[data-qa=status-tag]')

  draftBanner = (): PageElement => cy.get('[data-qa=draft-location-banner]')

  draftBannerCertifyButton = (): PageElement => this.draftBanner().get('[data-qa=add-to-cell-certificate]')

  draftBannerCertifyLinkButton = (): PageElement => this.draftBanner().get('[data-qa=view-request-details]')

  inactiveBanner = (): PageElement => cy.get('[data-qa=inactive-location-banner]')

  inactiveBannerHeader = (): PageElement => this.inactiveBanner().find('.govuk-notification-banner__heading')

  inactiveBannerRows = (): PageElement => this.inactiveBanner().find('.govuk-summary-list__row')

  inactiveBannerActivateCellButton = (): PageElement => this.inactiveBanner().get(`a:contains("Activate cell")`)

  inactiveBannerActivateEntireButton = (): PageElement => this.inactiveBanner().get(`a:contains("Activate entire")`)

  inactiveBannerActivateIndividualButton = (): PageElement =>
    this.inactiveBanner().get(`a:contains("Activate individual")`)

  inactiveBannerChangeLink = (): PageElement => this.inactiveBanner().get(`a:contains("Change")`).first()

  actionsMenu = (): PageElement => cy.get('button.moj-button-menu__toggle-button')

  convertToNonResAction = (): PageElement =>
    cy.get('.moj-button-menu__wrapper a:contains("Convert cell to non-residential room")')

  convertToCellButton = (): PageElement => cy.get('.govuk-button:contains("Convert to cell")')

  deleteButton = (): PageElement => cy.get('.govuk-button:contains("Delete")')

  deactivateButton = (): PageElement => cy.get('.govuk-button:contains("Deactivate")')

  deactivateAction = (): PageElement => cy.get('.moj-button-menu__wrapper a:contains("Deactivate cell")')

  summaryCards = {
    all: (): PageElement => cy.get('.hmpps-summary-card'),
    cnaText: (): PageElement => cy.get('[data-qa=cna-card]').find('[data-qa=bottom-content-line-1]'),
    workingCapacityText: (): PageElement =>
      cy.get('[data-qa=working-capacity-card]').find('[data-qa=bottom-content-line-1]'),
    maximumCapacityText: (): PageElement =>
      cy.get('[data-qa=maximum-capacity-card]').find('[data-qa=bottom-content-line-1]'),
    cnaChangeLink: (): PageElement => cy.get('[data-qa=cna-card]').find('.hmpps-mini-card__link a'),
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

  setCellTypeLink = (): PageElement => this.locationDetails().find('a:contains("Set cell type")')

  removeCellTypeLink = (): PageElement =>
    this.locationDetails().find('.govuk-summary-list__row:contains("Cell type")').find('a:contains("Remove")')

  changeDoorNumberLink = (): PageElement =>
    this.locationDetails().find('.govuk-summary-list__row:contains("Door number")').find('a:contains("Change")')

  changeSanitationLink = (): PageElement =>
    this.locationDetails().find('.govuk-summary-list__row:contains("Sanitation")').find('a:contains("Change")')

  changeLocationCodeLink = (): PageElement =>
    this.locationDetails().find('.govuk-summary-list__row:contains("Location")').find('a:contains("Change")')

  localNameRow = (): PageElement => cy.get('dt.govuk-summary-list__key').contains('Local Name')

  setLocalNameLink = (): PageElement => this.locationDetailsRows().eq(1).find('a:contains("Add local name")')

  changeLocalNameLink = (): PageElement => this.locationDetailsRows().eq(1).find('a:contains("Change")')

  removeLocalNameLink = (): PageElement => this.locationDetailsRows().eq(1).find('a:contains("Remove")')

  cellUsedForDetails = (): PageElement =>
    this.locationDetailsRows().eq(3).find('.govuk-summary-list__value').contains('Test type')

  changeCellUsedForLink = (): PageElement => this.locationDetailsRows().eq(3).find('a:contains("Change")')

  locationsTable = (): PageElement => cy.get('[data-qa=locations-table]')

  successBannerHeading = (): PageElement => cy.get('.govuk-notification-banner__heading')

  successBannerBody = (): PageElement => cy.get('.govuk-notification-banner__content > p.govuk-body')

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
