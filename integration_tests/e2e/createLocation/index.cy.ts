import Page from '../../pages/page'
import CreateLocationDetailsPage from '../../pages/createLocation/index'
import CreateLocationStructurePage from '../../pages/createLocation/structure'
import CreateLocationConfirmPage from '../../pages/createLocation/confirm'
import ManageLocationsIndexPage from '../../pages/manageLocations'
import buildDecoratedLocation from '../../../server/testutils/buildDecoratedLocation'
import LocationFactory from '../../../server/testutils/factories/location'
import ViewLocationsShowPage from '../../pages/viewLocations/show'

context('Set Wing Location Details', () => {
  const prisonId = 'TST'

  const locationAsWing = LocationFactory.build({
    accommodationTypes: [],
    capacity: {},
    leafLevel: false,
    locationType: 'WING',
    localName: '',
    specialistCellTypes: [],
    usedFor: [],
    pathHierarchy: '',
  })

  const decorated = buildDecoratedLocation({ ...locationAsWing, locationType: 'WING' })

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
    cy.task('stubLocationsLocationsResidentialSummary')
    cy.task('stubLocations', decorated)
    cy.task('setFeatureFlag', { createAndCertify: true })
    cy.task('stubGetPrisonConfiguration', { prisonId: 'TST', certificationActive: true })
  }

  context('With MANAGE_RESIDENTIAL_LOCATIONS role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RESIDENTIAL_LOCATIONS'])
    })

    const goToCreateLocationDetailsPage = () => {
      cy.signIn()
      cy.visit(`/manage-locations/${prisonId}`)
      const manageLocationsIndexPage = Page.verifyOnPage(ManageLocationsIndexPage)
      manageLocationsIndexPage.locationsCreateWingButton().click()
      CreateLocationDetailsPage.goTo(prisonId)
      return Page.verifyOnPage(CreateLocationDetailsPage)
    }

    const goToLocationStructurePage = () => {
      const detailsPage = goToCreateLocationDetailsPage()
      detailsPage.locationCodeInput().clear().type('ABC1')
      detailsPage.localNameTextInput().clear().type('testW')
      detailsPage.continueButton().click()

      CreateLocationStructurePage.goTo(prisonId)
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

    describe('Details', () => {
      it('shows the correct validation error for location code when submitting non-alphanumeric characters', () => {
        const detailsPage = goToCreateLocationDetailsPage()

        detailsPage.locationCodeInput().clear().type('!@£$')
        detailsPage.continueButton().click()

        cy.get('.govuk-error-summary__title').contains('There is a problem')
        cy.get('.govuk-error-summary__list').contains('Testwing code can only include numbers or letters')
        cy.get('#locationCode-error').contains('Testwing code can only include numbers or letters')
      })

      it('shows the correct validation error for location code when submitting nothing', () => {
        const detailsPage = goToCreateLocationDetailsPage()
        detailsPage.locationCodeInput().clear()
        detailsPage.continueButton().click()

        cy.get('.govuk-error-summary__list').contains('Enter a testwing code')
        cy.get('#locationCode-error').contains('Enter a testwing code')
      })

      it('shows the correct validation error for location code when submitting more than 5 characters', () => {
        const detailsPage = goToCreateLocationDetailsPage()
        detailsPage.locationCodeInput().clear().type('thisistoolong')
        detailsPage.continueButton().click()

        cy.get('.govuk-error-summary__list').contains('Testwing code must be 5 characters or less')
        cy.get('#locationCode-error').contains('Testwing code must be 5 characters or less')
      })

      it('shows the correct validation error when submitting a code that already exists', () => {
        cy.task('stubLocationsResidentialHierarchy', {
          prisonId: 'TST',
          residentialHierarchy: [
            {
              locationId: '123',
              locationType: 'WING',
              locationCode: 'ABC01',
              fullLocationPath: 'A-ABC01',
              localName: 'A Wing',
              level: 1,
              status: 'ACTIVE',
              subLocations: [],
            },
          ],
        })
        const detailsPage = goToCreateLocationDetailsPage()
        detailsPage.locationCodeInput().clear().type('ABC01')
        detailsPage.continueButton().click()

        cy.get('.govuk-error-summary__list').contains('A location with this testwing code already exists')
        cy.get('#locationCode-error').contains('A location with this testwing code already exists')
      })

      it('shows the correct validation error when submitting a localName that already exists', () => {
        cy.task('stubLocationsResidentialHierarchy', {
          prisonId: 'TST',
          residentialHierarchy: [
            {
              locationId: '123',
              locationType: 'WING',
              locationCode: 'ABC01',
              fullLocationPath: 'A-ABC01',
              localName: 'A Wing',
              level: 1,
              status: 'ACTIVE',
              subLocations: [],
            },
          ],
        })
        cy.task('stubLocationsCheckLocalNameExists')
        const detailsPage = goToCreateLocationDetailsPage()
        detailsPage.locationCodeInput().clear().type('new1')
        detailsPage.localNameTextInput().clear().type('exists')

        detailsPage.continueButton().click()

        cy.get('.govuk-error-summary__list').contains('A location with this name already exists')
        cy.get('#localName-error').contains('A location with this name already exists')
      })

      it('has a back link to the manage location page', () => {
        const detailsPage = goToCreateLocationDetailsPage()
        detailsPage.backLink().click()
        Page.verifyOnPage(ManageLocationsIndexPage)
      })

      it('has a cancel link to the manage location page', () => {
        const detailsPage = goToCreateLocationDetailsPage()
        detailsPage.cancelLink().click()
        Page.verifyOnPage(ManageLocationsIndexPage)
      })
    })

    describe('Structure', () => {
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
        structurePage.level2Select().select('Cells')
        structurePage.addLevelButton().click()
        structurePage.level3Select().select('Landings')

        structurePage.continueButton().click()

        cy.get('.govuk-error-summary__list').contains('You cannot have levels below cells')
      })

      it('shows the correct default values for select options and preview updates', () => {
        const structurePage = goToLocationStructurePage()

        // Check level 2
        structurePage.level2Select().should('have.value', 'Landings')
        structurePage.level3Select().should('not.be.visible')
        structurePage.level4Select().should('not.be.visible')

        // Add level 3
        structurePage.addLevelButton().click()
        structurePage.level3Select().should('be.visible').and('have.value', 'Cells')

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
        structurePage.structurePreviewLevel3().should('contain.text', '')
        structurePage.structurePreviewLevel4().should('contain.text', '')

        // Change first level, add remaining levels
        structurePage.level2Select().select('Spurs')
        structurePage.addLevelButton().click()
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

      it('has a cancel link to the manage location page', () => {
        const structurePage = goToLocationStructurePage()
        structurePage.cancelLink().click()
        Page.verifyOnPage(ManageLocationsIndexPage)
      })
    })

    describe('Confirm', () => {
      it('shows the correct information and successfully creates draft wing', () => {
        cy.task('reset')
        setupStubs(['MANAGE_RESIDENTIAL_LOCATIONS'])
        cy.task('stubCreateWing')
        cy.task('stubManageUsers')
        cy.task('stubManageUsersMe')
        cy.task('stubManageUsersMeCaseloads')
        cy.task('stubLocationsResidentialSummaryForCreateWing')
        cy.task('stubLocationById')
        cy.task('stubLocations', decorated)
        cy.task('setFeatureFlag', { createAndCertify: true })
        cy.task('stubGetPrisonConfiguration', { prisonId: 'TST', certificationActive: false })

        const confirmPage = goToConfirmPage()
        Page.verifyOnPage(CreateLocationConfirmPage)

        confirmPage.detailsTitle().contains('Wing details')
        confirmPage.structureDetails().contains('Testwing → Landings → Cells')
        confirmPage
          .structureChangeLink()
          .should('have.attr', 'href')
          .and('include', '/manage-locations/TST/create-new-testwing/structure')

        confirmPage.codeDetails().contains('ABC1')
        confirmPage
          .codeChangeLink()
          .should('have.attr', 'href')
          .and('include', '/manage-locations/TST/create-new-testwing/details')

        confirmPage.localNameDetails().contains('testW')
        confirmPage
          .localNameChangeLink()
          .should('have.attr', 'href')
          .and('include', '/manage-locations/TST/create-new-testwing/details')
        confirmPage.createButton().click()

        const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
        viewLocationsShowPage.successBanner().contains('Testwing created')
        viewLocationsShowPage.draftBanner().should('exist')
        viewLocationsShowPage.summaryCards.cnaText().contains('-')
        viewLocationsShowPage.summaryCards.workingCapacityText().contains('-')
        viewLocationsShowPage.summaryCards.maximumCapacityText().contains('-')
        viewLocationsShowPage.locationDetailsRows().eq(0).contains('ABC1')
        viewLocationsShowPage.locationDetailsRows().eq(1).contains('Test W')
      })
    })
  })
})
