import Page, { PageElement } from '../page'

export default class DeleteDraftConfirmPage extends Page {
  constructor() {
    super('Are you sure you want to delete this wing?')
    this.checkOnPage()
  }

  static goTo = (locationId?: string) => cy.visit(`/delete-draft/${locationId}/confirm`)

  confirmButton = (): PageElement => cy.get('button:contains("Delete wing")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')
}
