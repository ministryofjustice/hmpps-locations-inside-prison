import Page, { PageElement } from '../page'

export default class ChangeSignedOperationalCapacity extends Page {
  constructor() {
    super('Change signed operational capacity')
  }

  static goTo = (prisonId: string) => cy.visit(`/change-signed-operational-capacity/${prisonId}/`)

  newSignedOperationalCapacityInput = (): PageElement => cy.get('#newSignedOperationalCapacity')

  prisonGovernorApprovalInput = (): PageElement => cy.get('#prisonGovernorApproval')

  continueButton = (): PageElement => cy.get('button:contains("Update signed operational capacity")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')
}
