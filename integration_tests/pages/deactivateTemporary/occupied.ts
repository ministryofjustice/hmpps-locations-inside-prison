import Page, { PageElement } from '../page'

export default class DeactivateTemporaryOccupiedPage extends Page {
  constructor() {
    super("You can't deactivate this location as it is currently occupied")
  }

  cancelLink = (): PageElement => cy.get('a:contains("Return to location details")')
}
