import Page from '../../../pages/page'
import CreateLocationDetailsPage from '../../../pages/createLocation'
import ViewLocationsIndexPage from '../../../pages/viewLocations'
import LocationFactory from '../../../../server/testutils/factories/location'
import ViewLocationsShowPage from '../../../pages/viewLocations/show'
import LocationsApiStubber from '../../../mockApis/locationsApi'
import { LocationResidentialSummary } from '../../../../server/data/types/locationsApi'
import AuthStubber from '../../../mockApis/auth'
import ManageUsersApiStubber from '../../../mockApis/manageUsersApi'

context('Create Landing Details', () => {
  const prisonId = 'TST'
  const residentialSummary: LocationResidentialSummary = {
    parentLocation: LocationFactory.build({ id: '7e570000-0000-1000-8000-000000000002', pathHierarchy: 'A' }),
    subLocationName: 'Landings',
    subLocations: [LocationFactory.build({ id: '7e570000-0000-1000-8000-000000000003', pathHierarchy: 'A-ABC01' })],
    topLevelLocationType: 'Wings',
    locationHierarchy: [
      {
        id: '7e570000-0000-1000-8000-000000000001',
        prisonId: 'TST',
        code: '1',
        type: 'WING',
        pathHierarchy: '1',
        level: 1,
      },
    ],
    wingStructure: ['WING', 'LANDING', 'CELL'],
  }
  const residentialSummaryWithoutCellChild: LocationResidentialSummary = {
    parentLocation: LocationFactory.build({ id: '7e570000-0000-1000-8000-000000000002', pathHierarchy: 'A' }),
    subLocationName: 'Spurs',
    subLocations: [LocationFactory.build({ id: '7e570000-0000-1000-8000-000000000003', pathHierarchy: 'A-ABC01' })],
    topLevelLocationType: 'Wings',
    locationHierarchy: [
      {
        id: '7e570000-0000-1000-8000-000000000001',
        prisonId: 'TST',
        code: '1',
        type: 'WING',
        pathHierarchy: '1',
        level: 1,
      },
    ],
    wingStructure: ['WING', 'SPUR', 'LANDING', 'CELL'],
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
    LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation(residentialSummary)
    LocationsApiStubber.stub.stubLocations(residentialSummary.parentLocation)
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
      cy.visit(`/view-and-update-locations/${prisonId}/${residentialSummary.parentLocation.id}`)
      const viewLocationsIndexPage = Page.verifyOnPage(ViewLocationsIndexPage)
      viewLocationsIndexPage.locationsCreateButton().click()
      return Page.verifyOnPage(CreateLocationDetailsPage)
    }

    it('shows the correct validation error for location code when submitting non-alphanumeric characters', () => {
      const page = goToCreateLocationDetailsPage()
      page.locationCodeInput().clear().type('!@£$')
      page.createCellsNowRadio('no').click()
      page.continueButton().click()

      cy.get('.govuk-error-summary__title').contains('There is a problem')
      cy.get('.govuk-error-summary__list').contains('Landing code can only include numbers or letters')
      cy.get('#locationCode-error').contains('Landing code can only include numbers or letters')
    })

    it('shows the correct validation error for location code when submitting nothing', () => {
      const page = goToCreateLocationDetailsPage()
      page.locationCodeInput().clear()
      page.createCellsNowRadio('no').click()
      page.continueButton().click()

      cy.get('.govuk-error-summary__list').contains('Enter a landing code')
      cy.get('#locationCode-error').contains('Enter a landing code')
    })

    it('shows the correct validation error for location code when submitting more than 5 characters', () => {
      const page = goToCreateLocationDetailsPage()
      page.locationCodeInput().clear().type('thisistoolong')
      page.createCellsNowRadio('no').click()
      page.continueButton().click()

      cy.get('.govuk-error-summary__list').contains('Landing code must be 5 characters or less')
      cy.get('#locationCode-error').contains('Landing code must be 5 characters or less')
    })

    it('shows the correct validation error when submitting a code that already exists', () => {
      const page = goToCreateLocationDetailsPage()
      page.locationCodeInput().clear().type('ABC01')
      page.createCellsNowRadio('no').click()
      page.continueButton().click()

      cy.get('.govuk-error-summary__list').contains('A location with this landing code already exists')
      cy.get('#locationCode-error').contains('A location with this landing code already exists')
    })

    it('shows the correct validation error when submitting a localName that already exists', () => {
      LocationsApiStubber.stub.stubLocationsPrisonLocalName({ exists: true })
      const page = goToCreateLocationDetailsPage()
      page.locationCodeInput().clear().type('new1')
      page.localNameTextInput().clear().type('exists')
      page.createCellsNowRadio('no').click()

      page.continueButton().click()

      cy.get('.govuk-error-summary__list').contains('A location with this name already exists')
      cy.get('#localName-error').contains('A location with this name already exists')
    })

    it('shows the correct validation error when create cells has no selected value', () => {
      const page = goToCreateLocationDetailsPage()
      page.locationCodeInput().clear().type('new1')

      page.continueButton().click()

      cy.get('.govuk-error-summary__list').contains('Select yes if you want to create cells now')
      cy.get('#createCellsNow-error').contains('Select yes if you want to create cells now')
    })

    it('does not show create cells for non-cell child type', () => {
      LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation(residentialSummaryWithoutCellChild)

      const page = goToCreateLocationDetailsPage()
      page.createCellsNowRadio('no').should('not.exist')
    })

    it('has a back link to the manage location page', () => {
      const page = goToCreateLocationDetailsPage()
      page.backLink().click()
      Page.verifyOnPage(ViewLocationsIndexPage)
    })

    it('has a cancel link to the view location show page', () => {
      const page = goToCreateLocationDetailsPage()
      page.cancelLink().click()
      Page.verifyOnPage(ViewLocationsShowPage)
    })

    // TODO: write tests for create cells field "yes"
  })
})
