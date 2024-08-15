import Page, { PageElement } from '../page'

export default class NonResidentialConversionOccupiedPage extends Page {
  constructor() {
    super('You can’t convert this location as it is currently occupied')
  }

  cancelLink = (): PageElement => cy.get('a:contains("Return to location details")')
}
