import IndexPage from '../../pages/index'
import AuthSignInPage from '../../pages/authSignIn'
import Page, { PageElement } from '../../pages/page'
import LocationFactory from '../../../server/testutils/factories/location'
import { Location } from '../../../server/data/types/locationsApi'
import formatDate from '../../../server/formatters/formatDate'
import ArchivedLocationsIndexPage from '../../pages/archivedLocations'

context('Archived Locations Index', () => {
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
      cy.task('stubGetPrisonConfiguration', { prisonId: 'TST', certificationActive: 'INACTIVE' })
    })
    let locations: Location[]

    context('When there are archived locations', () => {
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

        cy.task('stubLocationsPrisonArchivedLocations', locations)
      })

      it('Correctly presents the API data', () => {
        cy.signIn()
        const indexPage = Page.verifyOnPage(IndexPage)

        indexPage.cards.archivedLocations().find('a').click()
        const archivedLocationsIndexPage = Page.verifyOnPage(ArchivedLocationsIndexPage)

        cy.title().should('eq', 'Archived locations - Residential locations')

        archivedLocationsIndexPage.locationsTable().should('exist')
        archivedLocationsIndexPage.locationsTableRows().each((row, i) => {
          const location = locations[i]
          const cells = archivedLocationsIndexPage.locationsTableCells(row as unknown as PageElement)

          cy.wrap(cells.location).contains(location.localName || location.pathHierarchy)
          cy.wrap(cells.locationType).contains('Cell')
          cy.wrap(cells.reason).contains('Demolished')
          cy.wrap(cells.deactivatedBy).contains(`john smith on ${formatDate(location.deactivatedDate)}`)
        })
        archivedLocationsIndexPage.emptyStateMessage().should('not.exist')
      })
    })

    context('When there are no archived locations', () => {
      beforeEach(() => {
        cy.task('stubLocationsPrisonArchivedLocations', [])
      })

      it('Displays an empty state page', () => {
        cy.signIn()
        const indexPage = Page.verifyOnPage(IndexPage)

        indexPage.cards.archivedLocations().find('a').click()
        const archivedLocationsIndexPage = Page.verifyOnPage(ArchivedLocationsIndexPage)

        cy.title().should('eq', 'Archived locations - Residential locations')

        archivedLocationsIndexPage.locationsTable().should('not.exist')
        archivedLocationsIndexPage.emptyStateMessage().should('exist')
      })
    })

    context('When there are archived locations but permanentlyInactiveReason is not provided ', () => {
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
            permanentlyInactiveReason: undefined,
            proposedReactivationDate: new Date(2023, 3, 14).toISOString(),
            planetFmReference: 'FM-1234321',
          }),
        ]

        cy.task('stubLocationsPrisonArchivedLocations', locations)
      })

      it('Correctly presents the API data', () => {
        cy.signIn()
        const indexPage = Page.verifyOnPage(IndexPage)

        indexPage.cards.archivedLocations().find('a').click()
        const archivedLocationsIndexPage = Page.verifyOnPage(ArchivedLocationsIndexPage)

        cy.title().should('eq', 'Archived locations - Residential locations')

        archivedLocationsIndexPage.locationsTable().should('exist')
        archivedLocationsIndexPage.locationsTableRows().each((row, i) => {
          const location = locations[i]
          const cells = archivedLocationsIndexPage.locationsTableCells(row as unknown as PageElement)

          cy.wrap(cells.location).contains(location.localName || location.pathHierarchy)
          cy.wrap(cells.locationType).contains('Cell')
          cy.wrap(cells.reason).contains('Not provided')
          cy.wrap(cells.deactivatedBy).contains(`john smith on ${formatDate(location.deactivatedDate)}`)
        })
        archivedLocationsIndexPage.emptyStateMessage().should('not.exist')
      })
    })
  })
})
