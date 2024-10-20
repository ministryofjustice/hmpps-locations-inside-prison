import Page, { PageElement } from '../../page'

export default class DeactivatePermanentWarningPage extends Page {
  constructor() {
    super('You are about to permanently deactivate this location')
  }

  static goTo = (locationId: string) => cy.visit(`/location/${locationId}/deactivate/permanent`)

  continueButton = (): PageElement => cy.get('button:contains("Continue with permanent deactivation")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')
}
