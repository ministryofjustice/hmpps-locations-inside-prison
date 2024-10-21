import Page, { PageElement } from '../page'

export default class DeactivateTypePage extends Page {
  constructor() {
    super('Do you want to deactivate this location temporarily or permanently?')
  }

  tempRadioButton = (): PageElement => cy.get(`input[name="deactivationType"][type="radio"][value="temporary"]`)

  permRadioButton = (): PageElement => cy.get(`input[name="deactivationType"][type="radio"][value="permanent"]`)

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')
}
