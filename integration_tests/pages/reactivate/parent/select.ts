import Page, { PageElement } from '../../page'

export default class ReactivateParentSelectPage extends Page {
  constructor() {
    super('')
  }

  locationCheckboxItem = (value: string): PageElement =>
    cy.get(`input[name="selectLocations"][type="checkbox"][value="${value}"]`)

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')
}
