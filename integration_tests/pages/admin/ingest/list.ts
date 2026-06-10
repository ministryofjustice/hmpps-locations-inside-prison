import Page, { PageElement } from '../../page'

export default class CellCertificateUploadsListPage extends Page {
  constructor() {
    super('Cell certificate uploads')
  }

  static goTo = (prisonId: string) => cy.visit(`/admin/${prisonId}/ingest-cert`)

  uploadNewButton = (): PageElement => cy.get('[data-qa=upload-new-button]')

  inProgressMessage = (): PageElement => cy.get('[data-qa=in-progress-message]')

  uploadsTable = (): PageElement => cy.get('[data-qa=uploads-table]')

  noUploadsMessage = (): PageElement => cy.get('[data-qa=no-uploads]')

  firstUploadLink = (): PageElement => cy.get('[data-qa=uploads-table] tbody tr').first().find('a')

  statusTags = (): PageElement => cy.get('[data-qa=uploads-table] [data-qa=upload-status-tag]')
}
