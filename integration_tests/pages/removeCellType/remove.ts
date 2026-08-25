import Page, { PageElement } from '../page'
import paths from '../../../server/utils/paths'

export default class RemoveCellTypePage extends Page {
  constructor() {
    super(/Are you sure you want to remove (all of )?the cell types?\?/)
  }

  static goTo = (locationId: string) => cy.visit(paths.location.removeCellType('TST', locationId))

  removeCellTypeButton = (): PageElement => cy.get('button:contains("Remove cell type")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')
}
