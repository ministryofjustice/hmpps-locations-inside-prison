import IndexPage from '../pages/index'
import AuthSignInPage from '../pages/authSignIn'
import Page from '../pages/page'
import AuthStubber from '../mockApis/auth'
import LocationsApiStubber from '../mockApis/locationsApi'
import ManageUsersApiStubber from '../mockApis/manageUsersApi'

context('Index', () => {
  context('Unauthenticated user', () => {
    beforeEach(() => {
      cy.task('reset')
      AuthStubber.stub.stubSignIn()
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
  })

  context('With the default role', () => {
    beforeEach(() => {
      cy.task('reset')
      AuthStubber.stub.stubSignIn()
      LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'ACTIVE' })
      ManageUsersApiStubber.stub.stubManageUsersMe()
      ManageUsersApiStubber.stub.stubManageUsersMeCaseloads()
    })

    it('Displays the tiles', () => {
      cy.signIn()
      const indexPage = Page.verifyOnPage(IndexPage)

      indexPage.cards.viewLocations().contains('View and update locations')
      indexPage.cards.manageLocations().should('not.exist')
      indexPage.cards.cellCertificate().should('not.exist')
      indexPage.cards.inactiveCells().contains('View all inactive cells')
      indexPage.cards.archivedLocations().contains('Archived locations')
    })

    it('has a feedback banner', () => {
      cy.signIn()
      cy.get('.feedback-banner a:contains("Suggest an improvement or report a problem with this service")').should(
        'have.attr',
        'href',
        'http://feedback-form',
      )
    })
  })

  context('With the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      cy.task('reset')
      AuthStubber.stub.stubSignIn({ roles: ['MANAGE_RES_LOCATIONS_OP_CAP'] })
      LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'ACTIVE' })
      ManageUsersApiStubber.stub.stubManageUsersMe()
      ManageUsersApiStubber.stub.stubManageUsersMeCaseloads()
    })

    it('Displays the tiles', () => {
      cy.signIn()
      const indexPage = Page.verifyOnPage(IndexPage)

      indexPage.cards.viewLocations().contains('View and update locations')
      indexPage.cards.manageLocations().should('not.exist')
      indexPage.cards.cellCertificate().should('not.exist')
      indexPage.cards.inactiveCells().contains('View all inactive cells')
      indexPage.cards.archivedLocations().contains('Archived locations')
    })

    it('has a feedback banner', () => {
      cy.signIn()
      cy.get('.feedback-banner a:contains("Suggest an improvement or report a problem with this service")').should(
        'have.attr',
        'href',
        'http://feedback-form',
      )
    })
  })

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      cy.task('reset')
      AuthStubber.stub.stubSignIn({ roles: ['MANAGE_RES_LOCATIONS_OP_CAP'] })
      LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'ACTIVE' })
      ManageUsersApiStubber.stub.stubManageUsersMe()
      ManageUsersApiStubber.stub.stubManageUsersMeCaseloads()
    })

    it('Displays the tiles', () => {
      cy.signIn()
      const indexPage = Page.verifyOnPage(IndexPage)

      indexPage.cards.viewLocations().should('not.exist')
      indexPage.cards.manageLocations().contains('Manage locations')
      indexPage.cards.inactiveCells().contains('View all inactive cells')
      indexPage.cards.archivedLocations().contains('Archived locations')
      indexPage.cards.cellCertificate().contains('Cell certificate')
    })
  })
})
