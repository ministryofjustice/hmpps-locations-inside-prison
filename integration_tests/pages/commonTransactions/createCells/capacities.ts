import Page, { PageElement } from '../../page'

export default class CreateCellsCapacitiesPage extends Page {
  constructor() {
    super(/Enter cell capacities and type/)
  }

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel")')
}
