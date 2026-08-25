import Page, { PageElement } from '../../page'

export default class CellCertificateUploadDetailPage extends Page {
  constructor() {
    super(/^Cell certificate upload$/)
  }

  summary = (): PageElement => cy.get('[data-qa=upload-summary]')

  locationsTable = (): PageElement => cy.get('[data-qa=locations-table]')

  cellCertificateLink = (): PageElement => cy.get('[data-qa=cell-certificate-link]')

  inProgressMessage = (): PageElement => cy.get('[data-qa=in-progress-message]')

  needsReviewAlert = (): PageElement => cy.get('[data-qa=needs-review-alert]')

  needsReviewTags = (): PageElement => cy.get('[data-qa=location-needs-review-tag]')
}
