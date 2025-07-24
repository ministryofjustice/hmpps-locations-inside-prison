import Page, { PageElement } from '../page'

export default class CreateLocationConfirmPage extends Page {
  constructor() {
    super(/Check and confirm the \w+ details/)
  }

  static goTo = (locationId: string) => cy.visit(`/create-new/${locationId}/confirm`)

  detailsTitle = (): PageElement => cy.get('.govuk-summary-card__title')

  changeDetailsKey = (i: number): PageElement => cy.get('.govuk-summary-list__key').eq(i)

  changeDetailsValue = (i: number): PageElement => cy.get('.govuk-summary-list__value').eq(i)

  changeDetailsLink = (i: number): PageElement => cy.get('.govuk-link').eq(i)

  createButton = (): PageElement => cy.get('button:contains("Create")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')
}
