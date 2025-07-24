import Page from '../../../pages/page'
import CreateLocationDetailsPage from '../../../pages/createLocation/index'
import CreateLocationStructurePage from '../../../pages/createLocation/structure'
import ViewLocationsIndexPage from '../../../pages/viewLocations'
import LocationFactory from '../../../../server/testutils/factories/location'
import CreateLocationConfirmPage from '../../../pages/createLocation/confirm'
import ViewLocationsShowPage from '../../../pages/viewLocations/show'
import LocationsApiStubber from '../../../mockApis/locationsApi'
import { PrisonResidentialSummary } from '../../../../server/data/types/locationsApi'
import AuthStubber from '../../../mockApis/auth'
import ManageUsersApiStubber from '../../../mockApis/manageUsersApi'

context('Create Wing Confirm', () => {
  const prisonId = 'TST'
  const existingWingLocation = LocationFactory.build({
    id: '7e570000-0000-1000-8000-000000000002',
    pathHierarchy: 'A',
    parentId: undefined,
    locationType: 'WING',
    localName: undefined,
  })
  const newWingLocation = LocationFactory.build({
    id: '7e570000-0000-1000-8000-000000000003',
    pathHierarchy: 'B',
    parentId: undefined,
    locationType: 'WING',
    status: 'DRAFT',
    localName: 'testW',
  })
  const residentialSummary: PrisonResidentialSummary = {
    prisonSummary: {
      workingCapacity: 0,
      signedOperationalCapacity: 0,
      maxCapacity: 0,
    },
    subLocationName: 'Wings',
    subLocations: [existingWingLocation],
    topLevelLocationType: 'Wings',
    locationHierarchy: [],
  }
  const createdLocationResidentialSummary = {
    parentLocation: newWingLocation,
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
    ],
  }

  const setupStubs = (roles = ['MANAGE_RESIDENTIAL_LOCATIONS']) => {
    cy.task('reset')
    cy.task('setFeatureFlag', { createAndCertify: true })
    AuthStubber.stub.stubSignIn({ roles })
    LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId, certificationActive: 'ACTIVE' })
    LocationsApiStubber.stub.stubLocationsConstantsAccommodationType()
    LocationsApiStubber.stub.stubLocationsConstantsConvertedCellType()
    LocationsApiStubber.stub.stubLocationsConstantsDeactivatedReason()
    LocationsApiStubber.stub.stubLocationsConstantsLocationType()
    LocationsApiStubber.stub.stubLocationsConstantsSpecialistCellType()
    LocationsApiStubber.stub.stubLocationsConstantsUsedForType()
    LocationsApiStubber.stub.stubLocationsLocationsResidentialSummary(residentialSummary)
    LocationsApiStubber.stub.stubLocationsPrisonLocalName({ exists: false, name: 'testW', prisonId: 'TST' })
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
      cy.visit(`/view-and-update-locations/${prisonId}`)
      const viewLocationsIndexPage = Page.verifyOnPage(ViewLocationsIndexPage)

      viewLocationsIndexPage.locationsCreateButton().click()

      return Page.verifyOnPage(CreateLocationDetailsPage)
    }

    const goToLocationStructurePage = () => {
      const detailsPage = goToCreateLocationDetailsPage()
      detailsPage.locationCodeInput().clear().type('B')
      detailsPage.localNameTextInput().clear().type('testW')

      detailsPage.continueButton().click()

      return Page.verifyOnPage(CreateLocationStructurePage)
    }

    const goToConfirmPage = () => {
      const structurePage = goToLocationStructurePage()

      structurePage.continueButton().click()

      return Page.verifyOnPage(CreateLocationConfirmPage)
    }

    it('shows the correct information and successfully creates draft wing', () => {
      setupStubs(['MANAGE_RESIDENTIAL_LOCATIONS'])
      LocationsApiStubber.stub.stubLocationsCreateWing(newWingLocation)
      LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation(createdLocationResidentialSummary)
      LocationsApiStubber.stub.stubLocations(newWingLocation)

      const confirmPage = goToConfirmPage()

      confirmPage.detailsTitle().contains('Wing details')

      confirmPage.changeDetailsKey(0).contains('Wing structure')
      confirmPage.changeDetailsValue(0).contains('Wing → Landings → Cells')
      confirmPage.changeDetailsLink(0).should('have.attr', 'href').and('include', '/create-new/TST/structure')

      confirmPage.changeDetailsKey(1).contains('Wing code')
      confirmPage.changeDetailsValue(1).contains('B')
      confirmPage.changeDetailsLink(1).should('have.attr', 'href').and('include', '/create-new/TST/details')

      confirmPage.changeDetailsKey(2).contains('Local name')
      confirmPage.changeDetailsValue(2).contains('testW')
      confirmPage.changeDetailsLink(2).should('have.attr', 'href').and('include', '/create-new/TST/details')

      confirmPage.createButton().click()

      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.successBanner().contains('Wing created')
      viewLocationsShowPage.draftBanner().should('exist')
      viewLocationsShowPage.summaryCards.cnaText().contains('-')
      viewLocationsShowPage.summaryCards.workingCapacityText().contains('-')
      viewLocationsShowPage.summaryCards.maximumCapacityText().contains('-')
      viewLocationsShowPage.locationDetailsRows().eq(0).contains('B')
      viewLocationsShowPage.locationDetailsRows().eq(1).contains('testW')
    })

    it('has a back link to the enter details page', () => {
      const structurePage = goToConfirmPage()
      structurePage.backLink().click()
      Page.verifyOnPage(CreateLocationStructurePage)
    })

    it('has a cancel link to the view location index page', () => {
      const structurePage = goToConfirmPage()
      structurePage.cancelLink().click()
      Page.verifyOnPage(ViewLocationsIndexPage)
    })
  })
})
