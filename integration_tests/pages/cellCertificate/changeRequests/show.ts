import Page from '../../page'

export default class CellCertificateChangeRequestsShowPage extends Page {
  constructor() {
    super('')
  }

  static goTo = (id: string) => cy.visit(`/TST/cell-certificate/change-requests/${id}`)
}
