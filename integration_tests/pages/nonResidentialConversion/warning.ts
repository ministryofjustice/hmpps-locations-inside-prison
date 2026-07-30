import Page, { PageElement } from '../page'
import paths from '../../../server/utils/paths'

export default class NonResidentialConversionWarningPage extends Page {
  constructor() {
    super('You are about to convert this cell to a non-residential room')
  }

  static goTo = (locationId: string) => cy.visit(paths.location.nonResidentialConversion('TST', locationId))

  continueButton = (): PageElement => cy.get('button:contains("Continue conversion to non-residential room")')

  cancelLink = (): PageElement => cy.get('a:contains("Cancel and return to location details")')
}
