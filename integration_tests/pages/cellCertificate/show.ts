import Page, { PageElement } from '../page'

export default class CellCertificateShowPage extends Page {
  constructor() {
    super('')
  }

  static goTo = (id: string) => cy.visit(`/TST/cell-certificate/${id}`)

  approvalText = (): PageElement => cy.get('p[data-qa="last-approval"]')

  signedOpCap = (): PageElement => cy.get('[data-qa="signed-op-cap"]')

  cnaCard = (): PageElement => cy.get('[data-qa="cna-card"]')

  workingCapacityCard = (): PageElement => cy.get('[data-qa="working-cap-card"]')

  maxCapacityCard = (): PageElement => cy.get('[data-qa="max-cap-card"]')
}
