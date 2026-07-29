import IndexPage from '../../pages/index'
import AuthSignInPage from '../../pages/authSignIn'
import Page from '../../pages/page'
import PrisonConfigurationIndexPage from '../../pages/admin'
import ResiStatusConfirmPage from '../../pages/admin/resi/confirm'
import NonResiStatusConfirmPage from '../../pages/admin/nonResi/confirm'
import CertApprovalConfirmPage from '../../pages/admin/certApproval/confirm'
import SegInRollCountConfirmPage from '../../pages/admin/segInRollCount/confirm'
import NomisScreenStatusConfirmPage from '../../pages/admin/nomisScreen/confirm'
import ManageUsersApiStubber from '../../mockApis/manageUsersApi'
import AuthStubber from '../../mockApis/auth'
import LocationsApiStubber from '../../mockApis/locationsApi'
import PrisonApiStubber from '../../mockApis/prisonApi'

context('Admin Index', () => {
  context('Without the MANAGE_RES_LOCATIONS_ADMIN role', () => {
    beforeEach(() => {
      cy.task('reset')
      AuthStubber.stub.stubSignIn({ roles: [] })
      ManageUsersApiStubber.stub.stubManageCaseloads()
    })

    it('Unauthenticated user directed to auth', () => {
      cy.visit('/')
      Page.verifyOnPage(AuthSignInPage)
    })

    it('Unauthenticated user navigating to sign in page directed to auth', () => {
      cy.visit('/sign-in')
      Page.verifyOnPage(AuthSignInPage)
    })

    it('redirects user to sign in page when accessed directly', () => {
      PrisonConfigurationIndexPage.goTo('TST')
      Page.verifyOnPage(AuthSignInPage)
    })
  })

  context('With the MANAGE_RES_LOCATIONS_ADMIN role and NOMIS screen disabled', () => {
    beforeEach(() => {
      cy.task('reset')
      AuthStubber.stub.stubSignIn({ roles: ['MANAGE_RES_LOCATIONS_ADMIN'] })
      ManageUsersApiStubber.stub.stubManageUsers()
      ManageUsersApiStubber.stub.stubManageUsersMe()
      ManageUsersApiStubber.stub.stubManageUsersMeCaseloads()
      ManageUsersApiStubber.stub.stubManageCaseloads()
      LocationsApiStubber.stub.stubPrisonConfiguration()
      LocationsApiStubber.stub.stubPrisonConfigurationActivateResi()
      LocationsApiStubber.stub.stubPrisonConfigurationActivateNonResi()
      LocationsApiStubber.stub.stubPrisonConfigurationCertApproval()
      LocationsApiStubber.stub.stubPrisonConfigurationIncludeSegInRollCount()
      PrisonApiStubber.stub.stubDisplayHousingCheckboxesDisabled()
      PrisonApiStubber.stub.stubDisplayHousingCheckboxesPost()
      PrisonApiStubber.stub.stubGetSplashScreenCondition()
      PrisonApiStubber.stub.stubCreateSplashScreenCondition()
      PrisonApiStubber.stub.stubUpdateSplashScreenCondition()
      cy.signIn()
    })

    it('When there is a prison configuration', () => {
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.cards.adminster().find('a').click()
      const prisonConfigurationIndexPage = Page.verifyOnPage(PrisonConfigurationIndexPage)
      prisonConfigurationIndexPage.checkOnPage()
    })

    it('Can enable a resi location', () => {
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.cards.adminster().find('a').click()
      const prisonConfigurationIndexPage = Page.verifyOnPage(PrisonConfigurationIndexPage)
      prisonConfigurationIndexPage.checkOnPage()
      cy.get('.govuk-summary-list__value').eq(1).contains('INACTIVE')
      prisonConfigurationIndexPage.changeResiLink().click()

      const resiStatusIndexPage = Page.verifyOnPage(ResiStatusConfirmPage)
      resiStatusIndexPage.checkOnPage()
      resiStatusIndexPage.confirmButton('Activate').click()

      Page.verifyOnPage(PrisonConfigurationIndexPage)
      cy.get('#govuk-notification-banner-title').contains('Success')
      cy.get('.govuk-notification-banner__content h3').contains('Residential locations status')
      cy.get('.govuk-notification-banner__content p').contains('You have changed the residential locations status.')
    })

    it('Can enable non-resi locations', () => {
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.cards.adminster().find('a').click()
      const prisonConfigurationIndexPage = Page.verifyOnPage(PrisonConfigurationIndexPage)
      prisonConfigurationIndexPage.checkOnPage()
      cy.get('.govuk-summary-list__value').eq(2).contains('INACTIVE')
      prisonConfigurationIndexPage.changeNonResiLink().click()

      const nonResiStatusIndexPage = Page.verifyOnPage(NonResiStatusConfirmPage)
      nonResiStatusIndexPage.checkOnPage()
      nonResiStatusIndexPage.confirmButton('Activate').click()

      Page.verifyOnPage(PrisonConfigurationIndexPage)
      cy.get('#govuk-notification-banner-title').contains('Success')
      cy.get('.govuk-notification-banner__content h3').contains('Non-residential locations status')
      cy.get('.govuk-notification-banner__content p').contains('You have changed the non-residential locations status.')
    })

    it('Can enable seg in roll count', () => {
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.cards.adminster().find('a').click()
      const prisonConfigurationIndexPage = Page.verifyOnPage(PrisonConfigurationIndexPage)
      prisonConfigurationIndexPage.checkOnPage()
      prisonConfigurationIndexPage.changeSegInRollLink().click()

      const segInRollCountIndexPage = Page.verifyOnPage(SegInRollCountConfirmPage)
      segInRollCountIndexPage.checkOnPage()
      segInRollCountIndexPage.confirmButton().click()

      Page.verifyOnPage(PrisonConfigurationIndexPage)
      cy.get('#govuk-notification-banner-title').contains('Success')
      cy.get('.govuk-notification-banner__content h3').contains('Include seg in roll count')
      cy.get('.govuk-notification-banner__content p').contains('You have changed the include seg in roll count status.')
    })

    it('Can enable certification', () => {
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.cards.adminster().find('a').click()
      const prisonConfigurationIndexPage = Page.verifyOnPage(PrisonConfigurationIndexPage)
      prisonConfigurationIndexPage.checkOnPage()
      prisonConfigurationIndexPage.changeCertificationLink().click()

      const certApprovalIndexPage = Page.verifyOnPage(CertApprovalConfirmPage)
      certApprovalIndexPage.checkOnPage()
      certApprovalIndexPage.confirmButton().click()

      Page.verifyOnPage(PrisonConfigurationIndexPage)
      cy.get('#govuk-notification-banner-title').contains('Success')
      cy.get('.govuk-notification-banner__content h3').contains('Certification approval status')
      cy.get('.govuk-notification-banner__content p').contains('You have changed the certification approval status.')
    })
  })

  context('With the MANAGE_RES_LOCATIONS_ADMIN role and NOMIS checkboxes enabled', () => {
    beforeEach(() => {
      cy.task('reset')
      AuthStubber.stub.stubSignIn({ roles: ['MANAGE_RES_LOCATIONS_ADMIN'] })
      ManageUsersApiStubber.stub.stubManageUsers()
      ManageUsersApiStubber.stub.stubManageUsersMe()
      ManageUsersApiStubber.stub.stubManageUsersMeCaseloads()
      ManageUsersApiStubber.stub.stubManageCaseloads()
      LocationsApiStubber.stub.stubPrisonConfigurationResiActive()
      LocationsApiStubber.stub.stubPrisonConfigurationDeactivateResi()
      PrisonApiStubber.stub.stubDisplayHousingCheckboxesEnabled()
      PrisonApiStubber.stub.stubDisplayHousingCheckboxesDelete()
      PrisonApiStubber.stub.stubGetSplashScreenCondition()
      PrisonApiStubber.stub.stubCreateSplashScreenCondition()
      PrisonApiStubber.stub.stubUpdateSplashScreenCondition()
      cy.signIn()
    })

    it('Can disable resi location', () => {
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.cards.adminster().find('a').click()
      const prisonConfigurationIndexPage = Page.verifyOnPage(PrisonConfigurationIndexPage)
      prisonConfigurationIndexPage.checkOnPage()
      cy.get('.govuk-summary-list__value').eq(1).contains('ACTIVE')

      prisonConfigurationIndexPage.changeResiLink().click()

      const resiStatusIndexPage = Page.verifyOnPage(ResiStatusConfirmPage)
      resiStatusIndexPage.checkOnPage()
      resiStatusIndexPage.confirmButton('Deactivate').click()

      Page.verifyOnPage(PrisonConfigurationIndexPage)
      cy.get('#govuk-notification-banner-title').contains('Success')
      cy.get('.govuk-notification-banner__content h3').contains('Residential locations status')
      cy.get('.govuk-notification-banner__content p').contains('You have changed the residential locations status.')
    })
  })

  context('With the MANAGE_RES_LOCATIONS_ADMIN role - NOMIS screen toggle', () => {
    beforeEach(() => {
      cy.task('reset')
      AuthStubber.stub.stubSignIn({ roles: ['MANAGE_RES_LOCATIONS_ADMIN'] })
      ManageUsersApiStubber.stub.stubManageUsers()
      ManageUsersApiStubber.stub.stubManageUsersMe()
      ManageUsersApiStubber.stub.stubManageUsersMeCaseloads()
      ManageUsersApiStubber.stub.stubManageCaseloads()
      LocationsApiStubber.stub.stubPrisonConfiguration()
      PrisonApiStubber.stub.stubGetSplashScreenCondition()
      PrisonApiStubber.stub.stubCreateSplashScreenCondition({ moduleName: 'OIMILOCA' })
      cy.signIn()
    })

    it('Change link opens the OIMILOCA wizard and saves a new status', () => {
      PrisonConfigurationIndexPage.goTo('TST')
      const prisonConfigurationIndexPage = Page.verifyOnPage(PrisonConfigurationIndexPage)
      prisonConfigurationIndexPage.checkOnPage()

      cy.get('a[href$="/change-nomis-screen-status/OIMILOCA"]').click()

      const nomisScreenPage = Page.verifyOnPage(NomisScreenStatusConfirmPage)
      nomisScreenPage.checkOnPage()

      nomisScreenPage.radio('BLOCKED').check()
      nomisScreenPage.saveButton().click()

      Page.verifyOnPage(PrisonConfigurationIndexPage)
      cy.get('#govuk-notification-banner-title').contains('Success')
      cy.get('.govuk-notification-banner__content h3').contains('Maintain internal locations (OIMILOCA) status')
      cy.get('.govuk-notification-banner__content p').contains(
        'You have changed the maintain internal locations (OIMILOCA) status.',
      )
    })
  })
})
