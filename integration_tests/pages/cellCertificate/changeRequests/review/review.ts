import Page, { PageElement } from '../../../page'

export default class CellCertificateChangeRequestsReviewPage extends Page {
  constructor() {
    super('')
  }

  static goTo = (id: string) => cy.visit(`/TST/cell-certificate/change-requests/${id}/review`)

  reviewRadio = (value: string): PageElement => cy.get(`input[name="approveOrReject"][type="radio"][value="${value}"]`)

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')

  submit = ({ approve }: { approve?: boolean }) => {
    if (approve !== undefined) {
      this.reviewRadio(approve ? 'APPROVE' : 'REJECT').check()
    }

    this.continueButton().click()
  }
}
