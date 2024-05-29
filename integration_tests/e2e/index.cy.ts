import IndexPage from '../pages/index'
import AuthSignInPage from '../pages/authSignIn'
import Page from '../pages/page'

context('Index', () => {
  context('Without the VIEW_INTERNAL_LOCATION role', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', { roles: [] })
    })

    it('Unauthenticated user directed to auth', () => {
      cy.visit('/')
      Page.verifyOnPage(AuthSignInPage)
    })

    it('Unauthenticated user navigating to sign in page directed to auth', () => {
      cy.visit('/sign-in')
      Page.verifyOnPage(AuthSignInPage)
    })
  })

  context('With the VIEW_INTERNAL_LOCATION role', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.task('stubManageUsersMe')
      cy.task('stubManageUsersMeCaseloads')
    })

    it('Displays the tiles', () => {
      cy.signIn()
      const indexPage = Page.verifyOnPage(IndexPage)

      indexPage.cards.viewLocations().contains('View and update locations')
      indexPage.cards.inactiveCells().contains('View all inactive cells')
      indexPage.cards.archivedLocations().contains('Archived locations')
      indexPage.cards.locationHistory().contains('Residential location history')
    })
  })
})
