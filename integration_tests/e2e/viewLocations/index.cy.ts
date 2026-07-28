import IndexPage from '../../pages/index'
import AuthSignInPage from '../../pages/authSignIn'
import Page, { PageElement } from '../../pages/page'
import ViewLocationsIndexPage from '../../pages/viewLocations'
import LocationFactory from '../../../server/testutils/factories/location'
import paths from '../../../server/utils/paths'
import ManageUsersApiStubber from '../../mockApis/manageUsersApi'
import AuthStubber from '../../mockApis/auth'
import LocationsApiStubber from '../../mockApis/locationsApi'
import PrisonResidentialSummaryFactory from '../../../server/testutils/factories/prisonResidentialSummary'

const residentialSummary = PrisonResidentialSummaryFactory.build({
  prisonSummary: {
    workingCapacity: 8,
    signedOperationalCapacity: 10,
    maxCapacity: 9,
  },
  subLocationName: 'TestWings',
  subLocations: [
    LocationFactory.build({ numberOfCellLocations: 4 }),
    LocationFactory.build({
      id: '7e570000-0000-0000-0000-000000000002',
      pathHierarchy: 'A-1-002',
      localName: undefined,
      code: '002',
      inactiveCells: 1,
      capacity: { maxCapacity: 3, workingCapacity: 1 },
      status: 'INACTIVE',
      numberOfCellLocations: 4,
    }),
  ],
  topLevelLocationType: 'Wings',
  locationHierarchy: [],
})

context('View Locations Index', () => {
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

  context('With the default role', () => {
    beforeEach(() => {
      cy.task('reset')
      AuthStubber.stub.stubSignIn({ roles: ['VIEW_INTERNAL_LOCATION'] })
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
      LocationsApiStubber.stub.stubLocationsLocationsResidentialSummary(residentialSummary)
      LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'ACTIVE' })
    })

    it('Correctly presents the API data', () => {
      cy.signIn()
      const indexPage = Page.verifyOnPage(IndexPage)

      indexPage.cards.viewLocations().find('a').click()
      const viewLocationsIndexPage = Page.verifyOnPage(ViewLocationsIndexPage)

      viewLocationsIndexPage.capacity.working().contains('8')
      viewLocationsIndexPage.capacity.signedOperational().contains('10')
      viewLocationsIndexPage.capacity.maximum().contains('9')

      viewLocationsIndexPage.locationsHeader().contains('TestWings')

      const expectedRows = [
        {
          location: {
            text: 'A-1-001',
            href: paths.location.view('TST', '7e570000-0000-0000-0000-000000000001'),
          },
          status: {
            text: 'Active',
          },
          workingCapacity: {
            text: '2',
          },
          maximumCapacity: {
            text: '2',
          },
          inactiveCells: {
            text: '0',
          },
          accommodationType: {
            text: 'Normal accommodation',
          },
          usedFor: {
            text: 'Close Supervision Centre (CSC)',
          },
        },
        {
          location: {
            text: 'A-1-002',
            href: paths.location.view('TST', '7e570000-0000-0000-0000-000000000002'),
          },
          status: {
            text: 'Inactive',
          },
          workingCapacity: {
            text: '1',
          },
          maximumCapacity: {
            text: '3',
          },
          inactiveCells: {
            text: '1',
            href: paths.location.inactiveCells('TST', '7e570000-0000-0000-0000-000000000002'),
          },
          accommodationType: {
            text: 'Normal accommodation',
          },
          usedFor: {
            text: 'Close Supervision Centre (CSC)',
          },
        },
      ]

      const rows = viewLocationsIndexPage.locationsTableRows()
      rows.each((row, index) => {
        const cells = viewLocationsIndexPage.locationsTableCells(row as unknown as PageElement)

        Object.entries(expectedRows[index]).forEach(([key, value]) => {
          const cell = cells[key]

          if ('href' in value) {
            cy.wrap(cell.find('a')).should('have.attr', 'href').and('include', value.href)
          }

          cy.wrap(cell).should('include.text', value.text)
        })
      })
    })
  })
})
