import Page, { PageElement } from '../page'
import paths from '../../../server/utils/paths'

export default class NonResidentialRoomPage extends Page {
  constructor() {
    super('')
  }

  static goTo = (prisonId?: string, locationId?: string) => cy.visit(paths.location.view(prisonId, locationId))

  changeLink = (): PageElement =>
    cy.get(
      '.govuk-summary-list__row:has(.govuk-summary-list__key:contains("Non-residential room")) a:contains("Change")',
    )
}
