import IndexPage from '../../pages/index'
import AuthSignInPage from '../../pages/authSignIn'
import Page from '../../pages/page'
import PrisonConfigurationIndexPage from '../../pages/admin'
import ResiStatusConfirmPage from '../../pages/admin/resi/confirm'
import CertApprovalConfirmPage from '../../pages/admin/certApproval/confirm'

context('Admin Index', () => {
  context('Without the MANAGE_RES_LOCATIONS_ADMIN role', () => {
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

    it('redirects user to sign in page when accessed directly', () => {
      PrisonConfigurationIndexPage.goTo('TST')
      Page.verifyOnPage(AuthSignInPage)
    })
  })

  context('With the MANAGE_RES_LOCATIONS_ADMIN role and NOMIS screen disabled', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', { roles: ['MANAGE_RES_LOCATIONS_ADMIN'] })
      cy.task('stubManageUsers')
      cy.task('stubManageUsersMe')
      cy.task('stubManageUsersMeCaseloads')
      cy.task('stubPrisonConfiguration')
      cy.task('stubPrisonConfigurationActivateResi')
      cy.task('stubPrisonConfigurationCertApproval')
      cy.task('stubDisplayHousingCheckboxesDisabled')
      cy.task('stubDisplayHousingCheckboxesPost')
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
      cy.get('.govuk-notification-banner__content h3').contains('Residential location status')
      cy.get('.govuk-notification-banner__content p').contains('You have changed the residential location status.')
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
      cy.task('stubSignIn', { roles: ['MANAGE_RES_LOCATIONS_ADMIN'] })
      cy.task('stubManageUsers')
      cy.task('stubManageUsersMe')
      cy.task('stubManageUsersMeCaseloads')
      cy.task('stubPrisonConfigurationResiActive')
      cy.task('stubPrisonConfigurationDeactivateResi')
      cy.task('stubDisplayHousingCheckboxesEnabled')
      cy.task('stubDisplayHousingCheckboxesDelete')
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
      resiStatusIndexPage.confirmButton('Inactivate').click()

      Page.verifyOnPage(PrisonConfigurationIndexPage)
      cy.get('#govuk-notification-banner-title').contains('Success')
      cy.get('.govuk-notification-banner__content h3').contains('Residential location status')
      cy.get('.govuk-notification-banner__content p').contains('You have changed the residential location status.')
    })
  })
})
