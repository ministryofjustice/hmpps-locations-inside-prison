import Page, { PageElement } from '../page'

export default class ChangeLocalNamePage extends Page {
  constructor() {
    super(/Are you sure you want to remove the local name?/)
  }

  static goTo = (locationId: string) => cy.visit(`/location/${locationId}/set-cell-type`)

  localNameTextInput = (): PageElement => cy.get('#localName')

  removeLocalNameButton = (): PageElement => cy.get('button:contains("Remove name")')

  removeLocalNameWarningText = (): PageElement => cy.get('.govuk-warning-text__text')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')
}
