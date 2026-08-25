import Page, { PageElement } from '../page'
import paths from '../../../server/utils/paths'

export default class ChangeCellCapacityPage extends Page {
  constructor() {
    super('')
  }

  static goTo = (locationId: string) => cy.visit(paths.location.changeCellCapacity('TST', locationId))

  cnaInput = (): PageElement => cy.get('#baselineCna')

  workingCapacityInput = (): PageElement => cy.get('#workingCapacity')

  maxCapacityInput = (): PageElement => cy.get('#maxCapacity')

  continueButton = (): PageElement => cy.get('button:contains("Continue")')

  saveButton = (): PageElement => cy.get('button:contains("Save cell capacity")')

  backLink = (): PageElement => cy.get('.govuk-back-link')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')
}
