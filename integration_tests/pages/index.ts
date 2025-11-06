import Page, { PageElement } from './page'

export default class IndexPage extends Page {
  constructor() {
    super('Residential locations')
  }

  headerUserName = (): PageElement => cy.get('[data-qa=header-user-name]')

  headerPhaseBanner = (): PageElement => cy.get('[data-qa=header-phase-banner]')

  cards = {
    viewLocations: (): PageElement => cy.get('[data-qa=view-locations-card]'),
    manageLocations: (): PageElement => cy.get('[data-qa=manage-locations-card]'),
    inactiveCells: (): PageElement => cy.get('[data-qa=inactive-cells-card]'),
    cellCertificate: (): PageElement => cy.get('[data-qa=cell-certificate-card]'),
    archivedLocations: (): PageElement => cy.get('[data-qa=archived-locations-card]'),
    locationHistory: (): PageElement => cy.get('[data-qa=location-history-card]'),
    adminster: (): PageElement => cy.get('[data-qa=admin-card]'),
  }
}
