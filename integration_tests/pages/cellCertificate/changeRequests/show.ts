import Page from '../../page'
import paths from '../../../../server/utils/paths'

export default class CellCertificateChangeRequestsShowPage extends Page {
  constructor() {
    super('')
  }

  static goTo = (id: string) => cy.visit(paths.cellCertificate.changeRequest.view('TST', id))
}
