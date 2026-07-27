import Page, { PageElement } from '../page'
import paths from '../../../server/utils/paths'

export default class ChangeSignedOperationalCapacity extends Page {
  constructor() {
    super('Change signed operational capacity')
  }

  static goTo = (prisonId: string) => cy.visit(paths.prison.changeSignedOperationalCapacity(prisonId))

  newSignedOperationalCapacityInput = (): PageElement => cy.get('#newSignedOperationalCapacity')

  prisonGovernorApprovalInput = (): PageElement => cy.get('#prisonGovernorApproval')

  continueButton = (): PageElement => cy.get('button:contains("Update signed operational capacity")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')
}
