import Page, { PageElement } from '../page'

export default class CreateLocationConfirmPage extends Page {
  constructor() {
    super(/Check and confirm the testwing details/)
  }

  static goTo = (locationId: string) => cy.visit(`/create-new/${locationId}/confirm`)

  detailsTitle = (): PageElement => cy.get('.govuk-summary-card__title')

  structureDetails = (): PageElement => cy.get('.govuk-summary-list__value').eq(0)

  structureChangeLink = (): PageElement => cy.get('.govuk-link').eq(0)

  codeDetails = (): PageElement => cy.get('.govuk-summary-list__value').eq(1)

  codeChangeLink = (): PageElement => cy.get('.govuk-link').eq(1)

  localNameDetails = (): PageElement => cy.get('.govuk-summary-list__value').eq(2)

  localNameChangeLink = (): PageElement => cy.get('.govuk-link').eq(2)

  createButton = (): PageElement => cy.get('button:contains("Create")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')
}
