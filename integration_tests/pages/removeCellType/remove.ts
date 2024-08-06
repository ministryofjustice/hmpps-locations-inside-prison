import Page, { PageElement } from '../page'

export default class RemoveCellTypePage extends Page {
  constructor() {
    super(/Are you sure you want to remove (the specific cell type|all of the specific cell types)\?/)
  }

  static goTo = (locationId: string) => cy.visit(`/location/${locationId}/remove-cell-type`)

  removeCellTypeButton = (): PageElement => cy.get('button:contains("Remove cell type")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')
}
