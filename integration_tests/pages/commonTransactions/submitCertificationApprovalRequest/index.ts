import Page, { PageElement } from '../../page'

export default class SubmitCertificationApprovalRequestPage extends Page {
  constructor() {
    super(/You are requesting (a change|2 changes) to the cell certificate/)
  }

  request = (approvalType: string): PageElement => cy.get(`[data-qa=approval-request-${approvalType}]`)

  checkbox = (): PageElement => cy.get(`input[name$="confirmation"]`)

  submitButton = (): PageElement => cy.get('button:contains("Submit")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')

  submit = ({ confirm }: { confirm?: true }) => {
    if (confirm !== undefined) {
      this.checkbox().click()
    }

    this.submitButton().click()
  }
}
