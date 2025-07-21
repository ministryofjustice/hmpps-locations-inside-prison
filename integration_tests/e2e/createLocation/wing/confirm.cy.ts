import Page from '../../../pages/page'
import CreateLocationDetailsPage from '../../../pages/createLocation/index'
import CreateLocationStructurePage from '../../../pages/createLocation/structure'
import ViewLocationsIndexPage from '../../../pages/viewLocations'
import LocationFactory from '../../../../server/testutils/factories/location'
import CreateLocationConfirmPage from '../../../pages/createLocation/confirm'
import ViewLocationsShowPage from '../../../pages/viewLocations/show'

context('Set Wing Location Structure', () => {
  const prisonId = 'TST'
  const residentialSummary = {
    prisonSummary: {
      workingCapacity: 0,
      signedOperationalCapacity: 0,
      maxCapacity: 0,
    },
    locationType: 'WING',
    subLocationName: 'TestWings',
    active: true,
    subLocations: [LocationFactory.build({ id: '7e570000-0000-1000-8000-000000000002', pathHierarchy: 'ABC01' })],
    topLevelLocationType: 'Wings',
    locationHierarchy: [],
  }

  const setupStubs = (roles = ['MANAGE_RESIDENTIAL_LOCATIONS']) => {
    cy.task('reset')
    cy.task('stubSignIn', { roles })
    cy.task('stubManageUsers')
    cy.task('stubManageUsersMe')
    cy.task('stubManageUsersMeCaseloads')
    cy.task('stubLocationsConstantsAccommodationType')
    cy.task('stubLocationsConstantsConvertedCellType')
    cy.task('stubLocationsConstantsDeactivatedReason')
    cy.task('stubLocationsConstantsLocationType')
    cy.task('stubLocationsConstantsSpecialistCellType')
    cy.task('stubLocationsConstantsUsedForType')
    cy.task('stubLocationsLocationsResidentialSummary', residentialSummary)
    cy.task('setFeatureFlag', { createAndCertify: true })
    cy.task('stubGetPrisonConfiguration', { prisonId, certificationActive: true })
  }

  context('With MANAGE_RESIDENTIAL_LOCATIONS role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RESIDENTIAL_LOCATIONS'])
    })

    const goToCreateLocationDetailsPage = () => {
      cy.signIn()
      cy.visit(`/view-and-update-locations/${prisonId}`)
      const viewLocationsIndexPage = Page.verifyOnPage(ViewLocationsIndexPage)
      viewLocationsIndexPage.locationsCreateButton().click()

      return Page.verifyOnPage(CreateLocationDetailsPage)
    }

    const goToLocationStructurePage = () => {
      const detailsPage = goToCreateLocationDetailsPage()
      detailsPage.locationCodeInput().clear().type('ABC1')
      detailsPage.localNameTextInput().clear().type('testW')
      detailsPage.continueButton().click()

      return Page.verifyOnPage(CreateLocationStructurePage)
    }

    const goToConfirmPage = () => {
      const structurePage = goToLocationStructurePage()
      structurePage.level2Select().select('Landings')
      structurePage.addLevelButton().click()
      structurePage.level3Select().select('Cells')

      structurePage.continueButton().click()

      CreateLocationConfirmPage.goTo(prisonId)
      return Page.verifyOnPage(CreateLocationConfirmPage)
    }

    it('shows the correct information and successfully creates draft wing', () => {
      cy.task('reset')
      setupStubs(['MANAGE_RESIDENTIAL_LOCATIONS'])
      cy.task('stubCreateWing', LocationFactory.build({ locationType: 'WING' }))
      cy.task('stubManageUsers')
      cy.task('stubManageUsersMe')
      cy.task('stubManageUsersMeCaseloads')
      cy.task('stubLocationsResidentialSummaryForCreateWing')
      cy.task('stubLocationById')
      cy.task('stubLocations', residentialSummary)
      cy.task('setFeatureFlag', { createAndCertify: true })
      cy.task('stubGetPrisonConfiguration', { prisonId: 'TST', certificationActive: false })

      const confirmPage = goToConfirmPage()
      Page.verifyOnPage(CreateLocationConfirmPage)

      confirmPage.detailsTitle().contains('Wing details')
      confirmPage.structureDetails().contains('Testwing → Landings → Cells')
      confirmPage.structureChangeLink().should('have.attr', 'href').and('include', '/create-new/TST/structure')

      confirmPage.codeDetails().contains('ABC1')
      confirmPage.codeChangeLink().should('have.attr', 'href').and('include', '/create-new/TST/details')

      confirmPage.localNameDetails().contains('testW')
      confirmPage.localNameChangeLink().should('have.attr', 'href').and('include', '/create-new/TST/details')
      confirmPage.createButton().click()

      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.successBanner().contains('Wing created')
      viewLocationsShowPage.draftBanner().should('exist')
      viewLocationsShowPage.summaryCards.cnaText().contains('-')
      viewLocationsShowPage.summaryCards.workingCapacityText().contains('-')
      viewLocationsShowPage.summaryCards.maximumCapacityText().contains('-')
      viewLocationsShowPage.locationDetailsRows().eq(0).contains('ABC1')
      viewLocationsShowPage.locationDetailsRows().eq(1).contains('Test W')
    })

    it('has a back link to the enter details page', () => {
      const structurePage = goToLocationStructurePage()
      structurePage.backLink().click()
      Page.verifyOnPage(CreateLocationDetailsPage)
    })

    it('has a cancel link to the view location index page', () => {
      const structurePage = goToLocationStructurePage()
      structurePage.cancelLink().click()
      Page.verifyOnPage(ViewLocationsIndexPage)
    })
  })
})
