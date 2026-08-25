import Page from '../page'
import paths from '../../../server/utils/paths'

export default class CellCertificateHistoryPage extends Page {
  constructor() {
    super('History of certificate changes')
  }

  static goTo = () => cy.visit(paths.cellCertificate.history('TST'))
}
