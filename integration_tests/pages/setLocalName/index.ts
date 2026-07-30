import Page, { PageElement } from '../page'

export default class SetLocalNamePage extends Page {
  constructor() {
    super(/Add local name/)
  }

  localNameTextInput = (): PageElement => cy.get('#localName')

  saveLocalNameButton = (): PageElement => cy.get('button:contains("Save name")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')
}
