import IndexPage from '../pages/index'
import AuthSignInPage from '../pages/authSignIn'
import Page from '../pages/page'
import AuthManageDetailsPage from '../pages/authManageDetails'
import ManageUsersApiStubber from '../mockApis/manageUsersApi'
import AuthStubber from '../mockApis/auth'
import LocationsApiStubber from '../mockApis/locationsApi'

context('Sign In', () => {
  context('With the default role', () => {
    beforeEach(() => {
      cy.task('reset')
      AuthStubber.stub.stubSignIn()
      ManageUsersApiStubber.stub.stubManageUsersMe()
      ManageUsersApiStubber.stub.stubManageUsersMeCaseloads()
      ManageUsersApiStubber.stub.stubManageCaseloads()
      LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'ACTIVE' })
    })

    it('Unauthenticated user directed to auth', () => {
      cy.visit('/')
      Page.verifyOnPage(AuthSignInPage)
    })

    it('Unauthenticated user navigating to sign in page directed to auth', () => {
      cy.visit('/sign-in')
      Page.verifyOnPage(AuthSignInPage)
    })

    it('displays the Authorisation Error page when authentication fails', () => {
      cy.visit('/autherror', { failOnStatusCode: false })
      cy.get('h1').contains('Authorisation Error')
    })

    it('User name visible in header', () => {
      cy.signIn()
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.headerUserName().should('contain.text', 'J. Smith')
    })

    it('Phase banner visible in header', () => {
      cy.signIn()
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.headerPhaseBanner().should('contain.text', 'TEST')
    })

    it('User can sign out', () => {
      cy.signIn()
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.signOut().click()
      Page.verifyOnPage(AuthSignInPage)
    })

    it('User can manage their details', () => {
      cy.signIn()
      AuthStubber.stub.stubAuthManageDetails()
      const indexPage = Page.verifyOnPage(IndexPage)

      indexPage.manageDetails().get('a').invoke('removeAttr', 'target')
      indexPage.manageDetails().click()
      Page.verifyOnPage(AuthManageDetailsPage)
    })

    it('Token verification failure takes user to sign in page', () => {
      cy.signIn()
      Page.verifyOnPage(IndexPage)
      cy.task('stubVerifyToken', false)

      // can't do a visit here as cypress requires only one domain
      cy.request('/').its('body').should('contain', 'Sign in')
    })

    it('Token verification failure clears user session', () => {
      cy.signIn()
      const indexPage = Page.verifyOnPage(IndexPage)
      cy.task('stubVerifyToken', false)

      // can't do a visit here as cypress requires only one domain
      cy.request('/').its('body').should('contain', 'Sign in')

      cy.task('stubVerifyToken', true)
      AuthStubber.stub.stubSignIn({ name: 'bobby brown' })

      cy.signIn()

      indexPage.headerUserName().contains('B. Brown')
    })
  })
})
