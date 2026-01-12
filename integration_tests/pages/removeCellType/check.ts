import Page, { PageElement } from '../page'

export default class CheckRemoveCellType extends Page {
  constructor() {
    super(/Are you sure you want to remove (all of )?the cell types?\?/)
  }

  static goTo = (locationId: string) => cy.visit(`/location/${locationId}/remove-cell-type`)

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  noCheckbox = (): PageElement => cy.get(`input[name="areYouSure"][type="radio"][value="no"]`)

  yesCheckbox = (): PageElement => cy.get(`input[name="areYouSure"][type="radio"][value="yes"]`)

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')
}
