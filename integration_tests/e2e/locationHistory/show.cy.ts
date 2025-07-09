import LocationFactory from '../../../server/testutils/factories/location'
import AuthSignInPage from '../../pages/authSignIn'
import Page from '../../pages/page'
import ViewLocationsShowPage from '../../pages/viewLocations/show'

context('show location history', () => {
  context('Without the VIEW_INTERNAL_LOCATION role', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', { roles: [] })
    })

    it('Unauthenticated user directed to auth', () => {
      cy.visit('/location-history/7e570000-0000-0000-0000-000000000001')
      Page.verifyOnPage(AuthSignInPage)
    })
  })

  context('With the VIEW_INTERNAL_LOCATION role', () => {
    const location = LocationFactory.build({ locationType: 'CELL', localName: '1-1-001' })

    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.task('stubManageUsers')
      cy.task('stubManageUsersMe')
      cy.task('stubManageUsersMeCaseloads')
      cy.task('stubLocationsConstantsAccommodationType')
      cy.task('stubLocationsConstantsConvertedCellType')
      cy.task('stubLocationsConstantsDeactivatedReason')
      cy.task('stubLocationsConstantsLocationType')
      cy.task('stubLocationsConstantsSpecialistCellType')
      cy.task('stubLocationsConstantsUsedForType')
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', { parentLocation: location })
      cy.task('stubLocations', location)
      cy.task('stubGetPrisonConfiguration', { prisonId: 'TST', certificationActive: 'ACTIVE' })
      cy.signIn()
    })

    it('has a caption showing the cell description', () => {
      cy.visit('/location-history/7e570000-0000-0000-0000-000000000001')
      cy.get('.govuk-caption-m').contains('Cell 1-1-001')
    })

    it('has the correct table headings', () => {
      cy.visit('/location-history/7e570000-0000-0000-0000-000000000001')
      cy.get('th.govuk-table__header').eq(0).contains('Type of change')
      cy.get('th.govuk-table__header').eq(1).contains('Changed from')
      cy.get('th.govuk-table__header').eq(2).contains('Changed to')
      cy.get('th.govuk-table__header').eq(3).contains('Changed by')
      cy.get('th.govuk-table__header').eq(4).contains('Date')
    })

    it('has the correct table rows', () => {
      cy.visit('/location-history/7e570000-0000-0000-0000-000000000001')
      cy.get('td.govuk-table__cell').eq(0).contains('Location Type')
      cy.get('td.govuk-table__cell').eq(1).contains('CELL')
      cy.get('td.govuk-table__cell').eq(2).contains('WING')
      cy.get('td.govuk-table__cell').eq(3).contains('john smith')
      cy.get('td.govuk-table__cell').eq(4).contains('05/07/2021')
    })

    it('has a link from the view location page', () => {
      ViewLocationsShowPage.goTo('TST', '7e570000-0000-0000-0000-000000000001')
      Page.verifyOnPage(ViewLocationsShowPage)
      cy.get('a:contains("View history")').click()
      cy.get('h1').contains('Location history')
    })

    it('has a back link to the view location page', () => {
      cy.visit('/location-history/7e570000-0000-0000-0000-000000000001')
      cy.get('.govuk-back-link').click()
      Page.verifyOnPage(ViewLocationsShowPage)
    })
  })
})
