import Page, { PageElement } from '../../../page'

export default class CellCertificateChangeRequestsApprovePage extends Page {
  constructor() {
    super('You are about to approve a change to the cell certificate')
  }

  confirmCheckbox = (): PageElement => cy.get(`input[name="cellsMeetStandards"][type="checkbox"]`)

  confirmButton = (): PageElement => cy.get('button:contains("Update cell certificate")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')

  submit = ({ confirm }: { confirm?: boolean }) => {
    if (confirm !== undefined) {
      this.confirmCheckbox().check()
    }

    this.confirmButton().click()
  }
}
