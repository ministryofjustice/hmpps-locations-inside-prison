import Page, { PageElement } from '../../page'
import paths from '../../../../server/utils/paths'

export default class CellCertificateChangeRequestsIndexPage extends Page {
  constructor() {
    super('Cell certificate')
    this.checkOnPage()
  }

  static goTo = () => cy.visit(paths.cellCertificate.changeRequest.view('TST'))

  checkOnPage() {
    cy.location('pathname').should('contain', '/cell-certificate/change-requests')
  }

  changeRequestsLink = (): PageElement => cy.get('a[href$="/cell-certificate/change-requests"]')
}
