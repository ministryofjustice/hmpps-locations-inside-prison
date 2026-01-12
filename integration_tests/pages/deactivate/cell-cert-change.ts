import Page, { PageElement } from '../page'

export default class CellCertChangePage extends Page {
  constructor() {
    super('Does the cell’s certified working capacity need to be decreased to 0 on the cell certificate?')
  }

  cancelLink = (): PageElement => cy.get('a:contains("Return to location details")')
}
