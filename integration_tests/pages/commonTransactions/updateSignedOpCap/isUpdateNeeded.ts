import Page, { PageElement } from '../../page'

export default class UpdateSignedOpCapIsUpdateNeededPage extends Page {
  constructor() {
    super("Check the establishment's signed operational capacity")
  }

  radio = (value: string): PageElement => cy.get(`input[name$="isUpdateNeeded"][type="radio"][value="${value}"]`)

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')

  submit = ({ updateNeeded }: { updateNeeded?: boolean }) => {
    if (updateNeeded !== undefined) {
      this.radio(updateNeeded ? 'YES' : 'NO').click()
    }

    this.continueButton().click()
  }
}
