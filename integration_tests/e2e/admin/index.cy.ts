import IndexPage from '../../pages/index'
import AuthSignInPage from '../../pages/authSignIn'
import Page from '../../pages/page'
import PrisonConfigurationIndexPage from '../../pages/admin'
import ResiStatusConfirmPage from '../../pages/admin/resi/confirm'
import CertApprovalConfirmPage from '../../pages/admin/certApproval/confirm'
import NonHousingConfirmPage from '../../pages/admin/nonHousing/confirm'

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
      cy.task('stubPrisonConfigurationResi')
      cy.task('stubPrisonConfigurationCertApproval')
      cy.task('stubDisplayHousingCheckboxesDisabled')
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
      prisonConfigurationIndexPage.changeResiLink().click()

      const resiStatusIndexPage = Page.verifyOnPage(ResiStatusConfirmPage)
      resiStatusIndexPage.checkOnPage()
      resiStatusIndexPage.confirmButton().click()

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

  context('With the MANAGE_RES_LOCATIONS_ADMIN role and NOMIS screen enabled', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', { roles: ['MANAGE_RES_LOCATIONS_ADMIN'] })
      cy.task('stubManageUsers')
      cy.task('stubManageUsersMe')
      cy.task('stubManageUsersMeCaseloads')
      cy.task('stubPrisonConfiguration')
      cy.task('stubDisplayHousingCheckboxesEnabled')
      cy.task('stubDisplayHousingCheckboxesUpdate')
      cy.signIn()
    })

    it('Can disable NOMIS screen', () => {
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.cards.adminster().find('a').click()
      const prisonConfigurationIndexPage = Page.verifyOnPage(PrisonConfigurationIndexPage)
      cy.get('.govuk-summary-list__value').eq(4).contains('Enabled')
      prisonConfigurationIndexPage.changePrisonNonHousing().click()

      const nonHousingConfirmPage = Page.verifyOnPage(NonHousingConfirmPage)
      nonHousingConfirmPage.checkOnPage()
      nonHousingConfirmPage.confirmButton().click()

      Page.verifyOnPage(PrisonConfigurationIndexPage)
      cy.get('#govuk-notification-banner-title').contains('Success')
      cy.get('.govuk-notification-banner__content h3').contains('Non-housing checkboxes')
      cy.get('.govuk-notification-banner__content p').contains(
        'You have turned off the NOMIS checkboxes in non-housing location screen.',
      )
    })
  })
})
