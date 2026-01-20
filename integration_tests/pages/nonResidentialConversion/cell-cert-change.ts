import Page, { PageElement } from '../page'

export default class CellCertChangePage extends Page {
  constructor() {
    super('Converting a cell to a non-residential room requires a change to the cell certificate')
  }

  continueButton = (): PageElement => cy.get('button[type="submit"]:contains("Continue")')
}
