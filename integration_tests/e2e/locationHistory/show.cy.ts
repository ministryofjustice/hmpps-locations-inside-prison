import LocationFactory from '../../../server/testutils/factories/location'
import AuthSignInPage from '../../pages/authSignIn'
import Page from '../../pages/page'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import paths from '../../../server/utils/paths'
import ManageUsersApiStubber from '../../mockApis/manageUsersApi'
import AuthStubber from '../../mockApis/auth'
import LocationsApiStubber from '../../mockApis/locationsApi'

context('show location history', () => {
  context('Unauthenticated user', () => {
    beforeEach(() => {
      cy.task('reset')
      AuthStubber.stub.stubSignIn({ roles: [] })
    })

    it('Unauthenticated user directed to auth', () => {
      cy.visit(paths.location.history('TST', '7e570000-0000-0000-0000-000000000001'))
      Page.verifyOnPage(AuthSignInPage)
    })
  })

  context('Without location in caseload', () => {
    const location = LocationFactory.build({ prisonId: 'MDI', locationType: 'CELL', localName: '1-1-002' })

    beforeEach(() => {
      cy.task('reset')
      AuthStubber.stub.stubSignIn()
      ManageUsersApiStubber.stub.stubManageUsers()
      ManageUsersApiStubber.stub.stubManageUsersMe()
      ManageUsersApiStubber.stub.stubManageUsersMeCaseloads()
      ManageUsersApiStubber.stub.stubManageCaseloads()
      LocationsApiStubber.stub.stubLocationsConstantsAccommodationType()
      LocationsApiStubber.stub.stubLocationsConstantsConvertedCellType()
      LocationsApiStubber.stub.stubLocationsConstantsDeactivatedReason()
      LocationsApiStubber.stub.stubLocationsConstantsLocationType()
      LocationsApiStubber.stub.stubLocationsConstantsApprovalType()
      LocationsApiStubber.stub.stubLocationsConstantsSpecialistCellType()
      LocationsApiStubber.stub.stubLocationsConstantsUsedForType()
      LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: location })
      LocationsApiStubber.stub.stubLocations(location)
      LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'ACTIVE' })
      LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'MDI', certificationActive: 'ACTIVE' })
      cy.signIn()
    })

    it('Denies access if prison is not in caseload', () => {
      cy.visit(paths.location.view(location), { failOnStatusCode: false })
      Page.verifyOnPage(ViewLocationsShowPage)
      cy.get('h1').contains('Authorisation Error')
    })
  })

  context('With location in caseload', () => {
    const location = LocationFactory.build({ locationType: 'CELL', localName: '1-1-001' })

    beforeEach(() => {
      cy.task('reset')
      AuthStubber.stub.stubSignIn()
      ManageUsersApiStubber.stub.stubManageUsers()
      ManageUsersApiStubber.stub.stubManageUsersMe()
      ManageUsersApiStubber.stub.stubManageUsersMeCaseloads()
      ManageUsersApiStubber.stub.stubManageCaseloads()
      LocationsApiStubber.stub.stubLocationsConstantsAccommodationType()
      LocationsApiStubber.stub.stubLocationsConstantsConvertedCellType()
      LocationsApiStubber.stub.stubLocationsConstantsDeactivatedReason()
      LocationsApiStubber.stub.stubLocationsConstantsLocationType()
      LocationsApiStubber.stub.stubLocationsConstantsApprovalType()
      LocationsApiStubber.stub.stubLocationsConstantsSpecialistCellType()
      LocationsApiStubber.stub.stubLocationsConstantsUsedForType()
      LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({ parentLocation: location })
      LocationsApiStubber.stub.stubLocations(location)
      LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'ACTIVE' })
      cy.signIn()
    })

    it('has a caption showing the cell description', () => {
      cy.visit(paths.location.history(location))
      cy.get('.govuk-caption-m').contains('Cell 1-1-001')
    })

    it('has the correct table headings', () => {
      cy.visit(paths.location.history(location))
      cy.get('th.govuk-table__header').eq(0).contains('Type of change')
      cy.get('th.govuk-table__header').eq(1).contains('Changed from')
      cy.get('th.govuk-table__header').eq(2).contains('Changed to')
      cy.get('th.govuk-table__header').eq(3).contains('Changed by')
      cy.get('th.govuk-table__header').eq(4).contains('Date')
    })

    it('has the correct table rows', () => {
      cy.visit(paths.location.history(location))
      cy.get('td.govuk-table__cell').eq(0).contains('Location Type')
      cy.get('td.govuk-table__cell').eq(1).contains('CELL')
      cy.get('td.govuk-table__cell').eq(2).contains('WING')
      cy.get('td.govuk-table__cell').eq(3).contains('john smith')
      cy.get('td.govuk-table__cell').eq(4).contains('05/07/2021')
    })

    it('has a link from the view location page', () => {
      ViewLocationsShowPage.goTo(location.prisonId, location.id)
      Page.verifyOnPage(ViewLocationsShowPage)
      cy.get('a:contains("View history")').click()
      cy.get('h1').contains('Location history')
    })

    it('has a back link to the view location page', () => {
      cy.visit(paths.location.history(location))
      cy.get('.govuk-back-link').click()
      Page.verifyOnPage(ViewLocationsShowPage)
    })
  })
})
