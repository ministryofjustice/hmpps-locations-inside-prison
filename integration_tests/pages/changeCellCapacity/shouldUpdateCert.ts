import Page, { PageElement } from '../page'

export default class ShouldUpdateCertPage extends Page {
  constructor() {
    super('Do you also want to change the certified working capacity on the cell certificate?')
  }

  radio = (value: 'YES' | 'NO'): PageElement => cy.get(`input[name="updateCert"][type="radio"][value="${value}"]`)

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')

  submit = ({ updateCert }: { updateCert?: boolean }) => {
    if (updateCert !== undefined) {
      this.radio(updateCert ? 'YES' : 'NO').click()
    }

    this.continueButton().click()
  }
}
