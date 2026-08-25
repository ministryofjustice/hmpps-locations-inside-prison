import Page, { PageElement } from '../../page'
import paths from '../../../../server/utils/paths'

export default class CellCertificateUploadsListPage extends Page {
  constructor() {
    super('Cell certificate uploads')
  }

  static goTo = (prisonId: string) => cy.visit(paths.admin.ingestCert(prisonId))

  uploadNewButton = (): PageElement => cy.get('[data-qa=upload-new-button]')

  inProgressMessage = (): PageElement => cy.get('[data-qa=in-progress-message]')

  uploadsTable = (): PageElement => cy.get('[data-qa=uploads-table]')

  noUploadsMessage = (): PageElement => cy.get('[data-qa=no-uploads]')

  firstUploadLink = (): PageElement => cy.get('[data-qa=uploads-table] tbody tr').first().find('a')

  statusTags = (): PageElement => cy.get('[data-qa=uploads-table] [data-qa=upload-status-tag]')
}
