Cypress.Commands.add('signIn', (options = { failOnStatusCode: true }) => {
  cy.viewport(1280, 1600)
  cy.request('/')
  return cy.task('getSignInUrl').then((url: string) => cy.visit(url, options))
})
