import Page, { PageElement } from '../../page'

export default class CellCertificateChangeRequestsIndexPage extends Page {
  constructor() {
    super('Cell certificate')
    this.checkOnPage()
  }

  static goTo = () => cy.visit('/TST/cell-certificate/change-requests')

  checkOnPage() {
    cy.location('pathname').should('contain', '/cell-certificate/change-requests')
  }

  changeRequestsLink = (): PageElement => cy.get('a[href$="/cell-certificate/change-requests"]')
}
