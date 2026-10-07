import Page from './page'

export default class PermissionDeniedPage extends Page {
  constructor() {
    super('You do not have permission to access this page')
  }

  static goTo = (url: string) => cy.visit(url, { failOnStatusCode: false })
}
