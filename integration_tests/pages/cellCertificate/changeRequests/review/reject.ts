import Page, { PageElement } from '../../../page'

export default class CellCertificateChangeRequestsRejectPage extends Page {
  constructor() {
    super('Reject change request')
  }

  explanationInput = (): PageElement => cy.get(`textarea[name$="explanation"]`)

  confirmButton = (): PageElement => cy.get('button:contains("Reject request")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')

  submit = ({ explanation }: { explanation?: string }) => {
    this.explanationInput().clear()
    if (explanation) {
      this.explanationInput().type(explanation)
    }

    this.confirmButton().click()
  }
}
