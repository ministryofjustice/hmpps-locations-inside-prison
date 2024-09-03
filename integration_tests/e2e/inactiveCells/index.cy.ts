import IndexPage from '../../pages/index'
import AuthSignInPage from '../../pages/authSignIn'
import Page, { PageElement } from '../../pages/page'
import InactiveCellsIndexPage from '../../pages/inactiveCells'
import LocationFactory from '../../../server/testutils/factories/location'
import { Location } from '../../../server/data/types/locationsApi'
import formatDate from '../../../server/formatters/formatDate'

function testInactiveCellsTable(inactiveCellsIndexPage: InactiveCellsIndexPage, locations: Location[]) {
  inactiveCellsIndexPage.locationsTableRows().each((row, i) => {
    const location = locations[i]
    const cells = inactiveCellsIndexPage.locationsTableCells(row as unknown as PageElement)

    cy.wrap(cells.location).contains(location.localName || location.pathHierarchy)
    cy.wrap(cells.location.find('a'))
      .should('have.attr', 'href')
      .and('equal', `/view-and-update-locations/${location.prisonId}/${location.id}`)
    cy.wrap(cells.reason).contains('Test type 1')
    cy.wrap(cells.estimatedReactivationDate).contains(formatDate(location.proposedReactivationDate))
    if (location.planetFmReference) {
      cy.wrap(cells.planetFmReference).contains(location.planetFmReference)
    }
    cy.wrap(cells.deactivatedBy).contains('john smith')
  })
}

context('Inactive Cells Index', () => {
  context('Without the VIEW_INTERNAL_LOCATION role', () => {
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
  })

  context('With the VIEW_INTERNAL_LOCATION role', () => {
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
    })
    let locations: Location[]

    context('When no location id is provided', () => {
      beforeEach(() => {
        locations = [
          LocationFactory.build({
            id: '7e570000-0000-000a-0001-000000000001',
            pathHierarchy: 'A-1-001',
            localName: undefined,
            code: '001',
            inactiveCells: 1,
            capacity: { maxCapacity: 3, workingCapacity: 1 },
            status: 'INACTIVE',
            deactivatedReason: 'TEST1',
            proposedReactivationDate: new Date(2023, 3, 14).toISOString(),
            planetFmReference: 'FM-1234321',
          }),
          LocationFactory.build({
            id: '7e570000-0000-000a-0001-000000000002',
            pathHierarchy: 'A-1-002',
            localName: undefined,
            code: '002',
            inactiveCells: 1,
            capacity: { maxCapacity: 3, workingCapacity: 1 },
            status: 'INACTIVE',
            deactivatedReason: 'TEST1',
            proposedReactivationDate: new Date(2024, 2, 1).toISOString(),
            planetFmReference: undefined,
          }),
          LocationFactory.build({
            id: '7e570000-0000-000b-0001-000000000001',
            pathHierarchy: 'B-1-001',
            localName: undefined,
            code: '001',
            inactiveCells: 1,
            capacity: { maxCapacity: 3, workingCapacity: 1 },
            status: 'INACTIVE',
            deactivatedReason: 'TEST1',
            proposedReactivationDate: new Date(2024, 1, 3).toISOString(),
            planetFmReference: 'FM-1133',
          }),
        ]

        cy.task('stubLocationsLocationsResidentialSummary')
        cy.task('stubLocationsPrisonInactiveCells', locations)
      })

      it('Correctly presents the API data for a prison', () => {
        cy.signIn()
        const indexPage = Page.verifyOnPage(IndexPage)

        indexPage.cards.inactiveCells().find('a').click()
        const inactiveCellsIndexPage = Page.verifyOnPage(InactiveCellsIndexPage)

        cy.title().should('eq', 'View all inactive cells - Residential locations')
        cy.get('h1').contains('Inactive cells (3)')

        testInactiveCellsTable(inactiveCellsIndexPage, locations)
      })
    })

    context('When location id is provided', () => {
      beforeEach(() => {
        locations = [
          LocationFactory.build({
            id: '7e570000-0000-000b-0001-000000000001',
            pathHierarchy: 'B-1-001',
            localName: null,
            code: '001',
            inactiveCells: 1,
            capacity: { maxCapacity: 3, workingCapacity: 1 },
            status: 'INACTIVE',
            deactivatedReason: 'TEST1',
            proposedReactivationDate: new Date(2024, 1, 3).toISOString(),
            planetFmReference: 'FM-1133',
          }),
        ]

        cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
          parentLocation: LocationFactory.build({
            localName: undefined,
            pathHierarchy: 'B',
            code: 'B',
            locationType: 'WING',
          }),
          locationHierarchy: [],
        })
        cy.task('stubLocationsPrisonInactiveCellsForLocation', locations)
      })

      it('Correctly presents the API data for a location', () => {
        cy.signIn()
        Page.verifyOnPage(IndexPage)

        cy.visit('/inactive-cells/TST/8ba666c5-1425-4509-a777-63343956da9a')
        const inactiveCellsIndexPage = Page.verifyOnPage(InactiveCellsIndexPage)

        cy.title().should('eq', 'Wing B - Inactive cells - View and update locations - Residential locations')
        cy.get('h1').contains('Inactive cells (1)')

        testInactiveCellsTable(inactiveCellsIndexPage, locations)
      })
    })
  })
})
