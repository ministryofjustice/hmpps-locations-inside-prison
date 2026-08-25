import Page, { PageElement } from '../page'
import paths from '../../../server/utils/paths'

export default class CellCertificateCurrentPage extends Page {
  constructor() {
    super('Cell certificate')
    this.checkOnPage()
  }

  static goTo = () => cy.visit(paths.cellCertificate.view('TST'))

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
