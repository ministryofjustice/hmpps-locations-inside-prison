import Page from '../../../pages/page'
import CreateLocationDetailsPage from '../../../pages/createLocation/index'
import CreateLocationStructurePage from '../../../pages/createLocation/structure'
import ViewLocationsIndexPage from '../../../pages/viewLocations'
import LocationFactory from '../../../../server/testutils/factories/location'
import LocationsApiStubber from '../../../mockApis/locationsApi'

context('Create Wing Structure', () => {
  const prisonId = 'TST'
  const residentialSummary = {
    prisonSummary: {
      workingCapacity: 8,
      signedOperationalCapacity: 10,
      maxCapacity: 9,
    },
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
    cy.task('setFeatureFlag', { createAndCertify: true })
    cy.task('stubGetPrisonConfiguration', { prisonId: 'TST', certificationActive: true })
    LocationsApiStubber.stub.stubLocationsConstantsAccommodationType()
    LocationsApiStubber.stub.stubLocationsConstantsConvertedCellType()
    LocationsApiStubber.stub.stubLocationsConstantsDeactivatedReason()
    LocationsApiStubber.stub.stubLocationsConstantsLocationType()
    LocationsApiStubber.stub.stubLocationsConstantsSpecialistCellType()
    LocationsApiStubber.stub.stubLocationsConstantsUsedForType()
    LocationsApiStubber.stub.stubLocationsLocationsResidentialSummary(residentialSummary)
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

    it('shows the correct validation error if structure levels contain duplicates', () => {
      const structurePage = goToLocationStructurePage()
      structurePage.level2Select().select('Cells')
      structurePage.addLevelButton().click()
      structurePage.level3Select().select('Cells')

      structurePage.continueButton().click()

      cy.get('.govuk-error-summary__list').contains('You cannot have two of the same level type')
    })

    it('shows the correct validation error if cells is not the last structure item', () => {
      const structurePage = goToLocationStructurePage()
      structurePage.level3Select().select('Spurs')

      structurePage.continueButton().click()

      cy.get('.govuk-error-summary__list').contains('The level 3 type must be cells')
    })

    it('shows the correct default values for select options and preview updates', () => {
      const structurePage = goToLocationStructurePage()

      // Check level 2
      structurePage.level2Select().should('have.value', 'Landings')
      structurePage.level3Select().should('have.value', 'Cells')
      structurePage.level4Select().should('not.be.visible')

      // Check preview
      structurePage.structurePreviewLevel2().find('p').should('have.text', 'Landings')
      structurePage.structurePreviewLevel3().find('p').should('have.text', 'Cells')

      // Check updated preview
      structurePage.level3Select().select('Landings')
      structurePage.structurePreviewLevel3().find('p').should('have.text', 'Landings')
    })

    it('shows correct order and updates structure preview when removing a level', () => {
      const structurePage = goToLocationStructurePage()

      // Check level 2 preview
      structurePage.structurePreviewLevel2().should('contain.text', 'Landings')
      structurePage.structurePreviewLevel3().should('contain.text', 'Cells')
      structurePage.structurePreviewLevel4().should('contain.text', '')

      // Change level 2 and level 3. Add 4th level
      structurePage.level2Select().select('Spurs')
      structurePage.level3Select().select('Landings')
      structurePage.addLevelButton().click()
      structurePage.level4Select().select('Cells')

      // Check full preview and values
      structurePage.structurePreviewLevel1().should('contain.text', 'Testwing')
      structurePage.structurePreviewLevel2().should('contain.text', 'Spurs')
      structurePage.structurePreviewLevel3().should('contain.text', 'Landings')
      structurePage.structurePreviewLevel4().should('contain.text', 'Cells')

      structurePage.level2Select().should('have.value', 'Spurs')
      structurePage.level3Select().should('have.value', 'Landings')
      structurePage.level4Select().should('have.value', 'Cells')

      // Remove level 3 and check updated preview
      structurePage.removeLevel3().click()

      structurePage.structurePreviewLevel1().should('contain.text', 'Testwing')
      structurePage.structurePreviewLevel2().should('contain.text', 'Spurs')
      structurePage.structurePreviewLevel3().should('contain.text', 'Cells')
      structurePage.structurePreviewLevel4().should('not.contain.text', 'Landings')
      structurePage.structurePreviewLevel4().should('not.contain.text', 'Cells')
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
