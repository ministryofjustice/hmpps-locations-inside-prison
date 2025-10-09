import Page from '../page'

export default class CellCertificateHistoryPage extends Page {
  constructor() {
    super('History of certificate changes')
  }

  static goTo = () => cy.visit('/TST/cell-certificate/history')
}
