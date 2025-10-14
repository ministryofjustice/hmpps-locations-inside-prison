import Page, { PageElement } from '../page'

export default class CellCertificateCurrentPage extends Page {
  constructor() {
    super('Cell certificate')
    this.checkOnPage()
  }

  static goTo = () => cy.visit('/TST/cell-certificate/current')

  checkOnPage() {
    cy.location('pathname').should('contain', '/cell-certificate/current')
  }

  approvalText = (): PageElement => cy.get('p[data-qa="last-approval"]')

  changeRequestsLink = (): PageElement => cy.get('a[href$="/cell-certificate/change-requests"]')

  viewHistoryLink = (): PageElement => cy.get('a[href$="/cell-certificate/history"]')

  signedOpCap = (): PageElement => cy.get('[data-qa="signed-op-cap"]')

  cnaCard = (): PageElement => cy.get('[data-qa="cna-card"]')

  workingCapacityCard = (): PageElement => cy.get('[data-qa="working-cap-card"]')

  maxCapacityCard = (): PageElement => cy.get('[data-qa="max-cap-card"]')
}
