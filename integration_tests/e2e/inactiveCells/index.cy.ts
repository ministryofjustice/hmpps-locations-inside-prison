import IndexPage from '../../pages/index'
import AuthSignInPage from '../../pages/authSignIn'
import Page, { PageElement } from '../../pages/page'
import InactiveCellsIndexPage from '../../pages/inactiveCells'
import LocationFactory from '../../../server/testutils/factories/location'
import formatDate from '../../../server/formatters/formatDate'
import AuthStubber from '../../mockApis/auth'
import ManageUsersApiStubber from '../../mockApis/manageUsersApi'
import LocationsApiStubber from '../../mockApis/locationsApi'
import LocationsApi from '../../mockApis/locationsApi'
import CertificationApprovalRequestFactory from '../../../server/testutils/factories/certificationApprovalRequest'

function testInactiveCellsTable(
  inactiveCellsIndexPage: InactiveCellsIndexPage,
  locations: ReturnType<typeof LocationFactory.build>[],
  certificationEnabled: boolean,
) {
  inactiveCellsIndexPage
    .locationsTableRows(certificationEnabled ? locations[0].inactiveStatus : undefined)
    .each((row, i) => {
      const location = locations[i]
      const cells = inactiveCellsIndexPage.locationsTableCells(row as unknown as PageElement)

      cy.wrap(cells.location).contains(location.pathHierarchy)
      cy.wrap(cells.location.find('a'))
        .should('have.attr', 'href')
        .and('equal', `/view-and-update-locations/${location.prisonId}/${location.id}`)

      if (location.inactiveStatus === 'INACTIVE_PEND_CHANGE_REQ') {
        cy.wrap(cells.changeType).contains('Cell deactivation (decrease certified working capacity)')
        cy.wrap(cells.requestedBy).contains('john smith on 3 October 2024')
        cy.wrap(cells.action).contains('View request details')
        cy.wrap(cells.action.find('a'))
          .should('have.attr', 'href')
          .and('equal', `/${location.prisonId}/cell-certificate/change-requests/${location.pendingApprovalRequestId}`)
      } else {
        cy.wrap(cells.reason).contains('Test type 1')
        cy.wrap(cells.estimatedReactivationDate).contains(
          location.proposedReactivationDate ? formatDate(location.proposedReactivationDate) : 'Not provided',
        )
        cy.wrap(cells.planetFmReference).contains(location.planetFmReference || 'Not provided')
        cy.wrap(cells.deactivatedBy).contains('john smith')
      }
    })
}

context('Inactive Cells Index', () => {
  context('Unauthenticated user', () => {
    beforeEach(() => {
      cy.task('reset')

      AuthStubber.stub.stubSignIn({ roles: [] })
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

  context('When certification is disabled', () => {
    context('With location in caseload', () => {
      beforeEach(() => {
        cy.task('reset')

        AuthStubber.stub.stubSignIn({ roles: ['VIEW_INTERNAL_LOCATION'] })
        ManageUsersApiStubber.stub.stubManageUsers()
        ManageUsersApiStubber.stub.stubManageUsersMe()
        ManageUsersApiStubber.stub.stubManageUsersMeCaseloads()
        LocationsApiStubber.stub.stubLocationsConstantsAccommodationType()
        LocationsApiStubber.stub.stubLocationsConstantsConvertedCellType()
        LocationsApiStubber.stub.stubLocationsConstantsDeactivatedReason()
        LocationsApiStubber.stub.stubLocationsConstantsLocationType()
        LocationsApiStubber.stub.stubLocationsConstantsSpecialistCellType()
        LocationsApiStubber.stub.stubLocationsConstantsUsedForType()
        LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'INACTIVE' })
      })
      let locations: ReturnType<typeof LocationFactory.build>[]

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
              deactivationReasonDescription: 'TEST1 REASON DESCRIPTION',
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
              deactivationReasonDescription: '',
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

          LocationsApiStubber.stub.stubLocationsLocationsResidentialSummary()
          LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({
            parentLocation: LocationFactory.build({
              localName: undefined,
              pathHierarchy: 'B',
              code: 'B',
              locationType: 'WING',
            }),
            locationHierarchy: [],
          })
          LocationsApiStubber.stub.stubLocationsPrisonInactiveCells(locations)
        })

        it('Correctly presents the API data for a prison', () => {
          cy.signIn()
          const indexPage = Page.verifyOnPage(IndexPage)

          indexPage.cards.inactiveCells().find('a').click()
          const inactiveCellsIndexPage = Page.verifyOnPage(InactiveCellsIndexPage)

          cy.title().should('eq', 'View all inactive cells - Residential locations')
          cy.get('h1').contains('Inactive cells (3)')

          testInactiveCellsTable(inactiveCellsIndexPage, locations, false)
        })

        it('Displays both the reason and reason description values when it is present in the data', () => {
          cy.signIn()
          const indexPage = Page.verifyOnPage(IndexPage)

          indexPage.cards.inactiveCells().find('a').click()
          Page.verifyOnPage(InactiveCellsIndexPage)

          cy.title().should('eq', 'View all inactive cells - Residential locations')
          cy.get('h1').contains('Inactive cells (3)')

          cy.get('.govuk-table__body > :nth-child(1) > :nth-child(2)').contains(
            'Test type 1 - TEST1 REASON DESCRIPTION',
          )
        })

        it('Displays only the reason when a reason description is an empty string value', () => {
          cy.signIn()
          const indexPage = Page.verifyOnPage(IndexPage)

          indexPage.cards.inactiveCells().find('a').click()
          Page.verifyOnPage(InactiveCellsIndexPage)

          cy.title().should('eq', 'View all inactive cells - Residential locations')
          cy.get('h1').contains('Inactive cells (3)')

          cy.get('.govuk-table__body > :nth-child(2) > :nth-child(2)').contains('Test type 1')
        })

        it('Displays only the reason when a reason description value is not present in the data', () => {
          cy.signIn()
          const indexPage = Page.verifyOnPage(IndexPage)

          indexPage.cards.inactiveCells().find('a').click()
          Page.verifyOnPage(InactiveCellsIndexPage)

          cy.title().should('eq', 'View all inactive cells - Residential locations')
          cy.get('h1').contains('Inactive cells (3)')

          cy.get('.govuk-table__body > :nth-child(3) > :nth-child(2)').contains('Test type 1')
        })
      })

      context('When location id is provided', () => {
        let parentLocation: ReturnType<typeof LocationFactory.build>
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
          parentLocation = LocationFactory.build({
            id: 'parentLocation',
            localName: undefined,
            pathHierarchy: 'B',
            code: 'B',
            locationType: 'WING',
          })

          LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({
            parentLocation,
            locationHierarchy: [],
          })
          LocationsApiStubber.stub.stubLocationsPrisonInactiveCellsForLocation(locations)
        })

        it('Correctly presents the API data for a location', () => {
          cy.signIn()
          Page.verifyOnPage(IndexPage)

          cy.visit(`/inactive-cells/${parentLocation.prisonId}/${parentLocation.id}`)
          const inactiveCellsIndexPage = Page.verifyOnPage(InactiveCellsIndexPage)

          cy.title().should('eq', 'Wing B - Inactive cells - Residential locations')
          cy.get('h1').contains('Inactive cells (1)')

          testInactiveCellsTable(inactiveCellsIndexPage, locations, false)
        })
      })

      context('When location id is provided and there is no any inactive cell', () => {
        let parentLocation: ReturnType<typeof LocationFactory.build>
        beforeEach(() => {
          locations = []
          parentLocation = LocationFactory.build({
            id: 'parentLocation',
            localName: undefined,
            pathHierarchy: 'B',
            code: 'B',
            locationType: 'WING',
          })
          LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({
            parentLocation,
            locationHierarchy: [],
          })
          LocationsApiStubber.stub.stubLocationsPrisonInactiveCellsForLocation(locations)
        })
        it('Correctly presents message there are no inactive locations when there is no any inactive cell', () => {
          cy.signIn()
          Page.verifyOnPage(IndexPage)
          cy.visit(`/inactive-cells/${parentLocation.prisonId}/${parentLocation.id}`)
          const inactiveCellsIndexPage = Page.verifyOnPage(InactiveCellsIndexPage)
          cy.title().should('eq', 'Wing B - Inactive cells - Residential locations')
          cy.get('h1').contains('Inactive cells (0)')
          cy.contains('There are no inactive locations')
          inactiveCellsIndexPage.locationsTable().should('not.exist')
          inactiveCellsIndexPage.emptyStateMessage().should('exist')
        })
      })
    })
  })

  context('When certification is enabled', () => {
    context('With location in caseload', () => {
      beforeEach(() => {
        cy.task('reset')

        AuthStubber.stub.stubSignIn({ roles: ['VIEW_INTERNAL_LOCATION'] })
        ManageUsersApiStubber.stub.stubManageUsers()
        ManageUsersApiStubber.stub.stubManageUsersMe()
        ManageUsersApiStubber.stub.stubManageUsersMeCaseloads()
        LocationsApiStubber.stub.stubLocationsConstantsAccommodationType()
        LocationsApiStubber.stub.stubLocationsConstantsConvertedCellType()
        LocationsApiStubber.stub.stubLocationsConstantsDeactivatedReason()
        LocationsApiStubber.stub.stubLocationsConstantsLocationType()
        LocationsApiStubber.stub.stubLocationsConstantsSpecialistCellType()
        LocationsApiStubber.stub.stubLocationsConstantsUsedForType()
        LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'ACTIVE' })
      })
      let locations: ReturnType<typeof LocationFactory.build>[]

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
              deactivationReasonDescription: 'TEST1 REASON DESCRIPTION',
              proposedReactivationDate: new Date(2023, 3, 14).toISOString(),
              planetFmReference: 'FM-1234321',
              inactiveStatus: 'INACTIVE_TEMP',
            }),
            LocationFactory.build({
              id: '7e570000-0000-000a-0001-000000000001',
              pathHierarchy: 'A-1-002',
              localName: undefined,
              code: '002',
              inactiveCells: 1,
              capacity: { maxCapacity: 3, workingCapacity: 1 },
              status: 'INACTIVE',
              deactivatedReason: 'TEST1',
              deactivationReasonDescription: '',
              proposedReactivationDate: new Date(2023, 3, 14).toISOString(),
              planetFmReference: 'FM-1234321',
              inactiveStatus: 'INACTIVE_TEMP',
            }),
            LocationFactory.build({
              id: '7e570000-0000-000a-0001-000000000001',
              pathHierarchy: 'A-1-003',
              localName: undefined,
              code: '003',
              inactiveCells: 1,
              capacity: { maxCapacity: 3, workingCapacity: 1 },
              status: 'INACTIVE',
              deactivatedReason: 'TEST1',
              proposedReactivationDate: new Date(2023, 3, 14).toISOString(),
              planetFmReference: 'FM-1234321',
              inactiveStatus: 'INACTIVE_TEMP',
            }),
            LocationFactory.build({
              id: '7e570000-0000-000a-0002-000000000001',
              pathHierarchy: 'A-2-001',
              localName: undefined,
              code: '002',
              inactiveCells: 1,
              capacity: { maxCapacity: 3, workingCapacity: 1 },
              status: 'INACTIVE',
              deactivatedReason: 'TEST1',
              deactivationReasonDescription: '',
              proposedReactivationDate: new Date(2024, 2, 1).toISOString(),
              planetFmReference: undefined,
              inactiveStatus: 'INACTIVE_PEND_CHANGE_REQ',
              pendingApprovalRequestId: 'pendingApprovalRequestId',
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
              inactiveStatus: 'INACTIVE_MATCHING_CELL_CERT',
            }),
          ]

          LocationsApiStubber.stub.stubLocationsLocationsResidentialSummary()
          LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({
            parentLocation: LocationFactory.build({
              localName: undefined,
              pathHierarchy: 'B',
              code: 'B',
              locationType: 'WING',
            }),
            locationHierarchy: [],
          })
          LocationsApiStubber.stub.stubLocationsPrisonInactiveCells(locations)
          LocationsApiStubber.stub.stubLocationsCertificationRequestApprovals(
            CertificationApprovalRequestFactory.build({
              id: 'pendingApprovalRequestId',
              locationId: '7e570000-0000-000a-0002-000000000001',
              approvalType: 'DEACTIVATION',
            }),
          )
          LocationsApiStubber.stub.stubLocations(locations[3])
        })

        it('Correctly presents the API data for a prison', () => {
          cy.signIn()
          const indexPage = Page.verifyOnPage(IndexPage)

          indexPage.cards.inactiveCells().find('a').click()
          const inactiveCellsIndexPage = Page.verifyOnPage(InactiveCellsIndexPage)

          cy.title().should('eq', 'View all inactive cells - Residential locations')
          cy.get('h1').contains('Inactive cells (5)')

          const [l1, l2, l3, l4, l5] = locations
          testInactiveCellsTable(inactiveCellsIndexPage, [l1, l2, l3], true)
          testInactiveCellsTable(inactiveCellsIndexPage, [l4], true)
          testInactiveCellsTable(inactiveCellsIndexPage, [l5], true)
        })

        it('Displays both the reason and reason description values correctly', () => {
          cy.signIn()
          const indexPage = Page.verifyOnPage(IndexPage)

          indexPage.cards.inactiveCells().find('a').click()
          Page.verifyOnPage(InactiveCellsIndexPage)

          cy.title().should('eq', 'View all inactive cells - Residential locations')
          cy.get('h1').contains('Inactive cells (5)')

          cy.get(
            '[data-qa=inactive-cells-table-INACTIVE_TEMP] > .govuk-table__body > :nth-child(1) > :nth-child(2)',
          ).contains('Test type 1 - TEST1 REASON DESCRIPTION')
          cy.get(
            '[data-qa=inactive-cells-table-INACTIVE_TEMP] > .govuk-table__body > :nth-child(2) > :nth-child(2)',
          ).contains('Test type 1')
          cy.get(
            '[data-qa=inactive-cells-table-INACTIVE_TEMP] > .govuk-table__body > :nth-child(3) > :nth-child(2)',
          ).contains('Test type 1')
        })
      })

      context('When location id is provided', () => {
        let parentLocation: ReturnType<typeof LocationFactory.build>
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
              inactiveStatus: 'INACTIVE_TEMP',
            }),
          ]
          parentLocation = LocationFactory.build({
            id: 'parentLocation',
            localName: undefined,
            pathHierarchy: 'B',
            code: 'B',
            locationType: 'WING',
          })

          LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({
            parentLocation,
            locationHierarchy: [],
          })
          LocationsApiStubber.stub.stubLocationsPrisonInactiveCellsForLocation(locations)
        })

        it('Correctly presents the API data for a location', () => {
          cy.signIn()
          Page.verifyOnPage(IndexPage)

          cy.visit(`/inactive-cells/${parentLocation.prisonId}/${parentLocation.id}`)
          const inactiveCellsIndexPage = Page.verifyOnPage(InactiveCellsIndexPage)

          cy.title().should('eq', 'Wing B - Inactive cells - Residential locations')
          cy.get('h1').contains('Inactive cells (1)')
          cy.get('h2').contains('Temporary inactive cells (1)')
          cy.get('h2').contains('Inactive cells with certificate change requests').should('not.exist')
          cy.get('h2').contains('Inactive cells with capacity decreased on cell certificate (0)')

          testInactiveCellsTable(inactiveCellsIndexPage, locations, true)
        })
      })

      context('When location id is provided and there is no any inactive cell', () => {
        let parentLocation: ReturnType<typeof LocationFactory.build>
        beforeEach(() => {
          locations = []
          parentLocation = LocationFactory.build({
            id: 'parentLocation',
            localName: undefined,
            pathHierarchy: 'B',
            code: 'B',
            locationType: 'WING',
          })
          LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({
            parentLocation,
            locationHierarchy: [],
          })
          LocationsApiStubber.stub.stubLocationsPrisonInactiveCellsForLocation(locations)
        })

        it('Correctly presents message there are no inactive locations when there is no any inactive cell', () => {
          cy.signIn()
          Page.verifyOnPage(IndexPage)
          cy.visit(`/inactive-cells/${parentLocation.prisonId}/${parentLocation.id}`)
          const inactiveCellsIndexPage = Page.verifyOnPage(InactiveCellsIndexPage)
          cy.title().should('eq', 'Wing B - Inactive cells - Residential locations')
          cy.get('h1').contains('Inactive cells (0)')
          cy.get('h2').contains('Temporary inactive cells (0)')
          cy.get('h2').contains('Inactive cells with certificate change requests').should('not.exist')
          cy.get('h2').contains('Inactive cells with capacity decreased on cell certificate (0)')
          cy.contains('There are no temporary inactive cells')
          cy.contains('There are no inactive cells with decreased capacity on the cell certificate')
          inactiveCellsIndexPage.locationsTable('INACTIVE_TEMP').should('not.exist')
          inactiveCellsIndexPage.locationsTable('INACTIVE_PEND_CHANGE_REQ').should('not.exist')
          inactiveCellsIndexPage.locationsTable('INACTIVE_MATCHING_CELL_CERT').should('not.exist')
        })
      })
    })
  })
})
