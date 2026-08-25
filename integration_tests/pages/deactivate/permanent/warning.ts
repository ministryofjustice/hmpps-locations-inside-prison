import Page, { PageElement } from '../../page'
import paths from '../../../../server/utils/paths'

export default class DeactivatePermanentWarningPage extends Page {
  constructor() {
    super('You are about to permanently deactivate this location')
  }

  static goTo = (prisonId: string, locationId: string) =>
    cy.visit(paths.location.deactivatePermanent(prisonId, locationId))

  continueButton = (): PageElement => cy.get('button:contains("Continue with permanent deactivation")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')
}
