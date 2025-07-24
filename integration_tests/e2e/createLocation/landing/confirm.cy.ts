import Page from '../../../pages/page'
import CreateLocationDetailsPage from '../../../pages/createLocation/index'
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
  })
})
