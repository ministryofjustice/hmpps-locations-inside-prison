import Page from '../../../pages/page'
import CreateLocationDetailsPage from '../../../pages/createLocation/index'
import CreateCellsPage from '../../../pages/createLocation/createCells'
import ViewLocationsIndexPage from '../../../pages/viewLocations'
import LocationFactory from '../../../../server/testutils/factories/location'
import CreateLocationConfirmPage from '../../../pages/createLocation/confirm'
import ViewLocationsShowPage from '../../../pages/viewLocations/show'
import LocationsApiStubber from '../../../mockApis/locationsApi'
import { LocationResidentialSummary } from '../../../../server/data/types/locationsApi'
import ManageUsersApiStubber from '../../../mockApis/manageUsersApi'
import AuthStubber from '../../../mockApis/auth'

context('Create Landing Confirm', () => {
  const prisonId = 'TST'
  const existingWingLocation = LocationFactory.build({
    id: '7e570000-0000-1000-8000-000000000002',
    pathHierarchy: 'A',
    parentId: undefined,
    locationType: 'WING',
    localName: undefined,
  })
  const existingLandingLocation = LocationFactory.build({
    id: '7e570000-0000-1000-8000-000000000003',
    pathHierarchy: 'A-1',
    parentId: '7e570000-0000-1000-8000-000000000002',
    locationType: 'LANDING',
    localName: undefined,
  })
  const newLandingLocation = LocationFactory.build({
    id: '7e570000-0000-1000-8000-000000000004',
    pathHierarchy: 'A-2',
    parentId: '7e570000-0000-1000-8000-000000000003',
    locationType: 'LANDING',
    status: 'DRAFT',
    localName: 'testL',
  })
  const residentialSummary: LocationResidentialSummary = {
    parentLocation: existingWingLocation,
    subLocationName: 'Landings',
    subLocations: [existingLandingLocation],
    topLevelLocationType: 'Wings',
    locationHierarchy: [],
    wingStructure: ['WING', 'LANDING', 'CELL'],
  }
  const createdLocationResidentialSummary = {
    parentLocation: newLandingLocation,
    subLocationName: 'Cells',
    subLocations: [],
    topLevelLocationType: 'Wings',
    locationHierarchy: [
      {
        id: existingWingLocation.id,
        prisonId: existingWingLocation.prisonId,
        code: existingWingLocation.code,
        type: existingWingLocation.locationType,
        pathHierarchy: existingWingLocation.pathHierarchy,
        level: 1,
      },
      {
        id: newLandingLocation.id,
        prisonId: newLandingLocation.prisonId,
        code: newLandingLocation.code,
        type: newLandingLocation.locationType,
        pathHierarchy: newLandingLocation.pathHierarchy,
        level: 1,
      },
    ],
    wingStructure: [],
  }

  const setupStubs = (roles = ['MANAGE_RESIDENTIAL_LOCATIONS']) => {
    cy.task('reset')
    cy.task('setFeatureFlag', { createAndCertify: true })
    AuthStubber.stub.stubSignIn({ roles })
    LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId, certificationActive: 'ACTIVE' })
    LocationsApiStubber.stub.stubLocations(existingLandingLocation)
    LocationsApiStubber.stub.stubLocations(existingWingLocation)
    LocationsApiStubber.stub.stubLocationsConstantsAccommodationType()
    LocationsApiStubber.stub.stubLocationsConstantsConvertedCellType()
    LocationsApiStubber.stub.stubLocationsConstantsDeactivatedReason()
    LocationsApiStubber.stub.stubLocationsConstantsLocationType()
    LocationsApiStubber.stub.stubLocationsConstantsSpecialistCellType()
    LocationsApiStubber.stub.stubLocationsConstantsUsedForType()
    LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation(residentialSummary)
    LocationsApiStubber.stub.stubLocationsPrisonLocalName({ exists: false, name: 'testL', prisonId: 'TST' })
    ManageUsersApiStubber.stub.stubManageUsers()
    ManageUsersApiStubber.stub.stubManageUsersMe()
    ManageUsersApiStubber.stub.stubManageUsersMeCaseloads()
  }

  context('With MANAGE_RESIDENTIAL_LOCATIONS role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RESIDENTIAL_LOCATIONS'])
    })

    const goToCreateLocationDetailsPage = () => {
      cy.signIn()
      cy.visit(`/view-and-update-locations/${prisonId}/${existingWingLocation.id}`)
      const viewLocationsIndexPage = Page.verifyOnPage(ViewLocationsShowPage)

      viewLocationsIndexPage.locationsCreateButton().click()

      return Page.verifyOnPage(CreateLocationDetailsPage)
    }

    const goToConfirmPage = () => {
      const detailsPage = goToCreateLocationDetailsPage()
      detailsPage.locationCodeInput().clear().type('2')
      detailsPage.localNameTextInput().clear().type('testL')
      detailsPage.createCellsNowRadio('no').click()

      detailsPage.continueButton().click()

      return Page.verifyOnPage(CreateLocationConfirmPage)
    }

    const goToCreateCellsPage = () => {
      const detailsPage = goToCreateLocationDetailsPage()
      detailsPage.locationCodeInput().clear().type('2')
      detailsPage.localNameTextInput().clear().type('testL')
      detailsPage.createCellsNowRadio('yes').click()
      detailsPage.continueButton().click()
      return Page.verifyOnPage(CreateCellsPage)
    }

    it('shows the correct information and successfully creates draft landing', () => {
      setupStubs(['MANAGE_RESIDENTIAL_LOCATIONS'])
      LocationsApiStubber.stub.stubLocationsCreateCells(newLandingLocation)
      LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation(createdLocationResidentialSummary)
      LocationsApiStubber.stub.stubLocations(newLandingLocation)

      const confirmPage = goToConfirmPage()

      confirmPage.detailsTitle().contains('Landing details')
      confirmPage
        .changeDetailsLink(0)
        .should('have.attr', 'href')
        .and('include', `/create-new/${existingWingLocation.id}/details`)

      confirmPage.changeDetailsKey(0).contains('Landing code')
      confirmPage.changeDetailsValue(0).contains('2')

      confirmPage.changeDetailsKey(1).contains('Local name')
      confirmPage.changeDetailsValue(1).contains('testL')

      confirmPage.changeDetailsKey(2).contains('Create cells on landing now')
      confirmPage.changeDetailsValue(2).contains('No')
      confirmPage.createButton().click()

      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.successBanner().contains('Landing created')
      viewLocationsShowPage.draftBanner().should('exist')
      viewLocationsShowPage.summaryCards.cnaText().contains('-')
      viewLocationsShowPage.summaryCards.workingCapacityText().contains('-')
      viewLocationsShowPage.summaryCards.maximumCapacityText().contains('-')
      viewLocationsShowPage.locationDetailsRows().eq(0).contains('A-2')
      viewLocationsShowPage.locationDetailsRows().eq(1).contains('testL')
    })

    it('has a back link to the enter details page', () => {
      const page = goToConfirmPage()
      page.backLink().click()
      Page.verifyOnPage(CreateLocationDetailsPage)
    })

    it('has a cancel link to the view location index page', () => {
      const page = goToConfirmPage()
      page.cancelLink().click()
      Page.verifyOnPage(ViewLocationsIndexPage)
    })

    context('Enter cell details', () => {
      it('navigates to create cells page when selecting yes for create cells', () => {
        const createCellsPage = goToCreateCellsPage()
        createCellsPage.cellsToCreateInput().clear().type('1')
        cy.get('.govuk-radios__item label').eq(0).should('contain.text', 'Normal accommodation')
        cy.get('.govuk-radios__item label').eq(1).should('contain.text', 'Care and separation')
        cy.get('.govuk-radios__item label').eq(2).should('contain.text', 'Healthcare inpatients')
        createCellsPage.accommodationTypeRadios('NORMAL_ACCOMMODATION').click()
      })

      it('shows the correct validation error when create cells has no input value', () => {
        const createCellsPage = goToCreateCellsPage()
        createCellsPage.cellsToCreateInput().clear()
        createCellsPage.accommodationTypeRadios('NORMAL_ACCOMMODATION').click()
        createCellsPage.continueButton().click()
        cy.get('.govuk-error-summary__list').contains('Enter how many cells you want to create')
        cy.get('#create-cells_cellsToCreate-error').contains('Enter how many cells you want to create')
      })

      it('shows the correct validation error when create cells has non numeric input', () => {
        const createCellsPage = goToCreateCellsPage()
        createCellsPage.cellsToCreateInput().clear().type('loads of cells')
        createCellsPage.accommodationTypeRadios('NORMAL_ACCOMMODATION').click()
        createCellsPage.continueButton().click()
        cy.get('.govuk-error-summary__list').contains('Cells must be a number')
        cy.get('#create-cells_cellsToCreate-error').contains('Cells must be a number')
      })

      it('shows the correct validation error when create cells input is over 999', () => {
        const createCellsPage = goToCreateCellsPage()
        createCellsPage.cellsToCreateInput().clear().type('1000')
        createCellsPage.accommodationTypeRadios('NORMAL_ACCOMMODATION').click()
        createCellsPage.continueButton().click()
        cy.get('.govuk-error-summary__list').contains('You can create a maximum of 999 cells at once')
        cy.get('#create-cells_cellsToCreate-error').contains('You can create a maximum of 999 cells at once')
      })

      it('shows the correct validation error when no accommodation type is selected', () => {
        const createCellsPage = goToCreateCellsPage()
        createCellsPage.cellsToCreateInput().clear().type('1')
        createCellsPage.continueButton().click()
        cy.get('.govuk-error-summary__list').contains('Select an accommodation type')
        cy.get('#create-cells_accommodationType-error').contains('Select an accommodation type')
      })
    })
  })
})
