import Page, { PageElement } from '../page'

export default class CellCertificateImportPreviewPage extends Page {
  constructor() {
    super(/^Preview of cell certificate import$/)
  }

  previewMessage = (): PageElement => cy.get('[data-qa=preview-message]')

  summary = (): PageElement => cy.get('[data-qa=import-summary]')

  locationsTable = (): PageElement => cy.get('[data-qa=locations-table]')

  totalsTable = (): PageElement => cy.get('[data-qa=certificate-totals-table]')

  notOnCertificateAlert = (): PageElement => cy.get('[data-qa=not-on-certificate-alert]')

  continueButton = (): PageElement => cy.get('[data-qa=continue-button]')

  cancelLink = (): PageElement => cy.get('[data-qa=cancel-link]')

  continuedImportLink = (): PageElement => cy.get('[data-qa=continued-import-link]')
}
