import Page, { PageElement } from '../page'
import paths from '../../../server/utils/paths'

export default class CellCertificateImportsListPage extends Page {
  constructor() {
    super('Import cell certificate')
  }

  static goTo = (prisonId: string) => cy.visit(paths.prison.cellCertificateImports(prisonId))

  newImportButton = (): PageElement => cy.get('[data-qa=import-new-button]')

  inProgressMessage = (): PageElement => cy.get('[data-qa=in-progress-message]')

  importsTable = (): PageElement => cy.get('[data-qa=imports-table]')

  noImportsMessage = (): PageElement => cy.get('[data-qa=no-imports]')

  firstImportLink = (): PageElement => cy.get('[data-qa=imports-table] tbody tr').first().find('a')

  statusTags = (): PageElement => cy.get('[data-qa=imports-table] [data-qa=import-status-tag]')
}
