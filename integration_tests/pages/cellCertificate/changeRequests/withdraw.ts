import Page, { PageElement } from '../../page'
import paths from '../../../../server/utils/paths'

export default class CellCertificateChangeRequestsWithdrawPage extends Page {
  constructor() {
    super('Withdraw change request')
  }

  static goTo = (id: string) => cy.visit(paths.cellCertificate.changeRequest.withdraw('TST', id))

  explanationInput = (): PageElement => cy.get(`textarea[name$="explanation"]`)

  confirmButton = (): PageElement => cy.get('button:contains("Confirm withdrawal")')

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
