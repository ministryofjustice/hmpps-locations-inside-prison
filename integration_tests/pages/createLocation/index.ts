import Page, { PageElement } from '../page'

export default class CreateLocationDetailsPage extends Page {
  constructor() {
    super(/Enter testwing details/)
  }

  static goTo = (locationId: string) => cy.visit(`/manage-locations/${locationId}/create-new-testwing/details`)

  localNameTextInput = (): PageElement => cy.get('#localName')

  locationCodeInput = (): PageElement => cy.get('#locationCode')

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')
}
