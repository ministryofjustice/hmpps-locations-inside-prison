import Page, { PageElement } from '../page'

export default class ChangeUsedForPage extends Page {
  constructor() {
    super('Change what the location is used for')
  }

  static goTo = (locationId: string) => cy.visit(`/location/${locationId}/change-used-for`)

  usedForWarningText = (): PageElement => cy.get('.govuk-warning-text__text')

  cellTypeCheckboxLabels = (): PageElement => cy.get('body').find('label.govuk-checkboxes__label')

  SaveButton = (): PageElement => cy.get('button:contains("Save used for")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')
}
