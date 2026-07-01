import Page, { PageElement } from '../page'

export default class RequestsPendingPage extends Page {
  constructor() {
    super('You can’t request a change to the certificate for this location currently')
  }

  backLink = (): PageElement => cy.get('.govuk-back-link')

  certApprovalsLink = (): PageElement => cy.get('a:contains("View change requests")')

  returnLink = (): PageElement => cy.get('a:contains("Return to location details")')
}
