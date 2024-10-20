import Page, { PageElement } from '../../page'

export default class DeactivatePermanentDetailsPage extends Page {
  constructor() {
    super('Permanent deactivation details')
  }

  reasonInput = (): PageElement => cy.get('#permanentDeactivationReason')

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')
}
