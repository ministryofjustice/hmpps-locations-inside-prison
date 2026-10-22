import IndexPage from '../../pages/index'
import AuthSignInPage from '../../pages/authSignIn'
import Page from '../../pages/page'
import PrisonConfigurationIndexPage from '../../pages/prisonConfiguration'
import ManageUsersApiStubber from '../../mockApis/manageUsersApi'
import AuthStubber from '../../mockApis/auth'
import LocationsApiStubber from '../../mockApis/locationsApi'
import PrisonApiStubber from '../../mockApis/prisonApi'

context('Manage prisons', () => {
  context('Without signing in', () => {
    beforeEach(() => {
      cy.task('reset')
      AuthStubber.stub.stubSignIn({ roles: [] })
      ManageUsersApiStubber.stub.stubManageCaseloads()
    })

    it('redirects the user to the sign in page', () => {
      PrisonConfigurationIndexPage.goTo()
      Page.verifyOnPage(AuthSignInPage)
    })
  })

  context('With the MANAGE_RES_LOCATIONS_ADMIN role', () => {
    beforeEach(() => {
      cy.task('reset')
      AuthStubber.stub.stubSignIn({ roles: ['MANAGE_RES_LOCATIONS_ADMIN'] })
      ManageUsersApiStubber.stub.stubManageUsers()
      ManageUsersApiStubber.stub.stubManageUsersMe()
      ManageUsersApiStubber.stub.stubManageUsersMeCaseloads()
      ManageUsersApiStubber.stub.stubManageCaseloads()
      LocationsApiStubber.stub.stubPrisonConfiguration()
      LocationsApiStubber.stub.stubAllPrisonConfigurations()
      LocationsApiStubber.stub.stubPrisonConfigurationActivateResi()
      LocationsApiStubber.stub.stubPrisonConfigurationDeactivateResi()
      LocationsApiStubber.stub.stubPrisonConfigurationCertApproval()
      PrisonApiStubber.stub.stubGetSplashScreenCondition()
      PrisonApiStubber.stub.stubCreateSplashScreenCondition()
      PrisonApiStubber.stub.stubUpdateSplashScreenCondition()
      cy.signIn()
    })

    it('lists every prison from the Admin card', () => {
      Page.verifyOnPage(IndexPage).cards.adminster().find('a').click()

      const page = Page.verifyOnPage(PrisonConfigurationIndexPage)
      page.rolloutSummary('residential').contains('50%')
      page.rolloutSummary('residential').contains('1 of 2 prisons')
      page.rolloutSummary('certification').contains('50%')
      page.rolloutSummary('certification').contains('1 of 2 prisons')
      page.prisonName('MDI').contains('Moorland (HMP & YOI)')
      page.residentialStatus('MDI').contains('On')
      page.certificationStatus('MDI').contains('On')
      page.residentialToggle('MDI').contains('Turn off')
      page.prisonName('TST').contains('Test (HMP)')
      page.residentialStatus('TST').contains('Off')
      page.certificationStatus('TST').contains('Off')
      page.residentialToggle('TST').contains('Turn on')
      cy.contains('seg in roll count').should('not.exist')
    })

    it('searches by prison name or ID', () => {
      PrisonConfigurationIndexPage.goTo()
      const page = Page.verifyOnPage(PrisonConfigurationIndexPage)

      page.search().type('moor')
      page.searchButton().click()

      page.prisonName('MDI').should('exist')
      page.prisonName('TST').should('not.exist')
    })

    it('switches MVP1 on for a prison', () => {
      PrisonApiStubber.stub.stubUpdateSplashScreenCondition({ blockScreen: true })
      PrisonConfigurationIndexPage.goTo()
      Page.verifyOnPage(PrisonConfigurationIndexPage).residentialToggle('TST').click()

      const page = Page.verifyOnPage(PrisonConfigurationIndexPage)
      page.successBanner().contains('MVP1 switched on')
      page.successBanner().contains('MVP1 is now switched on for Test (HMP).')
    })

    it('says when the NOMIS screen could not be blocked', () => {
      PrisonConfigurationIndexPage.goTo()
      Page.verifyOnPage(PrisonConfigurationIndexPage).residentialToggle('TST').click()

      const page = Page.verifyOnPage(PrisonConfigurationIndexPage)
      page.errorBanner().contains('MVP1 is switched on for Test (HMP)')
      page.errorBanner().contains('The NOMIS residential screen could not be blocked.')
    })

    it('switches MVP1 off for a prison', () => {
      PrisonConfigurationIndexPage.goTo()
      Page.verifyOnPage(PrisonConfigurationIndexPage).residentialToggle('MDI').click()

      Page.verifyOnPage(PrisonConfigurationIndexPage).successBanner().contains('MVP1 is now switched off for Moorland')
    })

    it('switches certification on for a prison', () => {
      PrisonConfigurationIndexPage.goTo()
      Page.verifyOnPage(PrisonConfigurationIndexPage).certificationToggle('TST').click()

      const page = Page.verifyOnPage(PrisonConfigurationIndexPage)
      page.successBanner().contains('Certification switched on')
      page.successBanner().contains('Certification is now switched on for Test (HMP).')
    })

    it('redirects the old admin page to the list of prisons', () => {
      cy.visit('/TST/admin')
      Page.verifyOnPage(PrisonConfigurationIndexPage)
    })
  })
})
