import Page, { PageElement } from '../page'

export default class NonResidentialRoomPage extends Page {
  constructor() {
    super('')
  }

  static goTo = (prisonId?: string, locationId?: string) =>
    cy.visit(`/view-and-update-locations/${[prisonId, locationId].join('/')}`)

  changeLink = (): PageElement => cy.get('a:contains("Change")')
}
