import AuthSignInPage from '../../pages/authSignIn'
import Page from '../../pages/page'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import { Location, LocationSummary } from '../../../server/data/locationsApiClient'
import LocationFactory from '../../../server/testutils/factories/location'
import formatDate from '../../../server/formatters/formatDate'

context('View Locations Show', () => {
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

  function validateBreadcrumbs(viewLocationsShowPage: ViewLocationsShowPage, locationHierarchy: LocationSummary[]) {
    viewLocationsShowPage
      .breadcrumbs()
      .eq(0)
      .contains('Digital Prison Services')
      .should('have.attr', 'href')
      .and('equal', 'http://localhost:3100')

    viewLocationsShowPage
      .breadcrumbs()
      .eq(1)
      .contains('Residential locations')
      .should('have.attr', 'href')
      .and('equal', '/')

    viewLocationsShowPage
      .breadcrumbs()
      .eq(2)
      .contains('Wings')
      .should('have.attr', 'href')
      .and('equal', '/view-and-update-locations/TST')

    locationHierarchy.slice(0, locationHierarchy.length - 1).forEach((breadcrumb, i) => {
      viewLocationsShowPage
        .breadcrumbs()
        .eq(i + 3)
        .contains(new RegExp(`^\\s*${breadcrumb.localName || breadcrumb.code}\\s*$`, 'g'))
        .should('have.attr', 'href')
        .and('equal', `/view-and-update-locations/${breadcrumb.prisonId}/${breadcrumb.id}`)
    })
  }

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

    function testShow({
      location,
      locationHierarchy,
      subLocations = [],
    }: {
      location: Location
      locationHierarchy: LocationSummary[]
      subLocations?: Location[]
    }) {
      cy.signIn()

      cy.visit('/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000000')
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      cy.get('h1').contains(location.localName || location.pathHierarchy)
      viewLocationsShowPage
        .locationType()
        .contains(location.locationType.toLowerCase().replace(/^\w/, a => a.toUpperCase()))
      viewLocationsShowPage
        .certifiedTag()
        .should(`${location.leafLevel && location.certification.certified ? '' : 'not.'}exist`)
      viewLocationsShowPage.statusTag().contains(
        location.status
          .replace(/_/, '-')
          .toLowerCase()
          .replace(/^\w/, a => a.toUpperCase()),
      )

      validateBreadcrumbs(viewLocationsShowPage, locationHierarchy)

      if (location.status === 'INACTIVE') {
        viewLocationsShowPage.inactiveBanner().should('exist')
        viewLocationsShowPage.inactiveBannerRows().should('have.length', 3)
        viewLocationsShowPage.inactiveBannerRows().eq(0).find('.govuk-summary-list__key').contains('Reason')
        viewLocationsShowPage.inactiveBannerRows().eq(0).find('.govuk-summary-list__value').contains('Test type')
        viewLocationsShowPage
          .inactiveBannerRows()
          .eq(1)
          .find('.govuk-summary-list__key')
          .contains('Estimated reactivation date')
        viewLocationsShowPage
          .inactiveBannerRows()
          .eq(1)
          .find('.govuk-summary-list__value')
          .contains(formatDate(location.proposedReactivationDate))
        viewLocationsShowPage
          .inactiveBannerRows()
          .eq(2)
          .find('.govuk-summary-list__key')
          .contains('Planet FM reference number')
        viewLocationsShowPage
          .inactiveBannerRows()
          .eq(2)
          .find('.govuk-summary-list__value')
          .contains(location.planetFmReference)
      } else {
        viewLocationsShowPage.inactiveBanner().should('not.exist')
      }

      if (location.status === 'NON_RESIDENTIAL') {
        viewLocationsShowPage.summaryCards.all().should('have.length', 0)
      } else {
        viewLocationsShowPage.summaryCards.all().should('have.length', location.leafLevel ? 2 : 3)
        viewLocationsShowPage.summaryCards.workingCapacityText().contains(`${location.capacity.workingCapacity}`)
        viewLocationsShowPage.summaryCards.maximumCapacityText().contains(`${location.capacity.maxCapacity}`)
        if (!location.leafLevel) {
          viewLocationsShowPage.summaryCards.inactiveCellsText().contains(`${location.inactiveCells}`)

          viewLocationsShowPage.summaryCards
            .inactiveCellsViewLink()
            .should(`${location.inactiveCells > 0 ? '' : 'not.'}exist`)
          if (location.inactiveCells > 0) {
            viewLocationsShowPage.summaryCards
              .inactiveCellsViewLink()
              .should('have.attr', 'href')
              .and('equal', `/inactive-cells/${location.prisonId}/${location.id}`)
          }
        }
      }

      let detailsRows = 0
      viewLocationsShowPage.locationDetailsRows().eq(detailsRows).find('.govuk-summary-list__key').contains('Location')
      viewLocationsShowPage
        .locationDetailsRows()
        .eq(detailsRows)
        .find('.govuk-summary-list__value')
        .contains(location.pathHierarchy)
      detailsRows += 1

      if (!location.leafLevel) {
        viewLocationsShowPage
          .locationDetailsRows()
          .eq(detailsRows)
          .find('.govuk-summary-list__key')
          .contains('Local name')

        if (location.localName) {
          viewLocationsShowPage
            .locationDetailsRows()
            .eq(detailsRows)
            .find('.govuk-summary-list__value')
            .contains(location.localName)
        } else {
          viewLocationsShowPage
            .locationDetailsRows()
            .eq(detailsRows)
            .find('.govuk-summary-list__value')
            .invoke('text')
            .invoke('trim')
            .should('equal', '')
        }
        detailsRows += 1
      }

      if (location.status !== 'NON_RESIDENTIAL') {
        if (location.locationType === 'CELL') {
          viewLocationsShowPage
            .locationDetailsRows()
            .eq(detailsRows)
            .find('.govuk-summary-list__key')
            .contains('Cell type')
          viewLocationsShowPage
            .locationDetailsRows()
            .eq(detailsRows)
            .find('.govuk-summary-list__value')
            .contains('Accessible cell')
          detailsRows += 1
        }

        viewLocationsShowPage
          .locationDetailsRows()
          .eq(detailsRows)
          .find('.govuk-summary-list__key')
          .contains('Accommodation type')
        viewLocationsShowPage
          .locationDetailsRows()
          .eq(detailsRows)
          .find('.govuk-summary-list__value')
          .contains('Test type')
        detailsRows += 1
      } else {
        viewLocationsShowPage
          .locationDetailsRows()
          .eq(detailsRows)
          .find('.govuk-summary-list__key')
          .contains('Non-residential room')
        viewLocationsShowPage
          .locationDetailsRows()
          .eq(detailsRows)
          .find('.govuk-summary-list__value')
          .contains('Office')
        detailsRows += 1
      }

      if (location.usedFor.length) {
        viewLocationsShowPage
          .locationDetailsRows()
          .eq(detailsRows)
          .find('.govuk-summary-list__key')
          .contains('Used for')
        viewLocationsShowPage
          .locationDetailsRows()
          .eq(detailsRows)
          .find('.govuk-summary-list__value')
          .contains('Test type')
        detailsRows += 1
      }

      if (!location.leafLevel) {
        viewLocationsShowPage
          .locationDetailsRows()
          .eq(detailsRows)
          .find('.govuk-summary-list__key')
          .contains('Last updated')
        viewLocationsShowPage
          .locationDetailsRows()
          .eq(detailsRows)
          .find('.govuk-summary-list__value')
          .contains('Today by john smith')
        detailsRows += 1
      }

      viewLocationsShowPage.locationDetailsRows().should('have.length', detailsRows)

      if (subLocations.length) {
        viewLocationsShowPage.locationsTable().should('exist')
      } else {
        viewLocationsShowPage.locationsTable().should('not.exist')
      }
    }

    let location: Location

    context('When the location is a Wing', () => {
      const locationDetails = {
        localName: null,
        id: 'b8813f47-4497-4c88-9dee-a8d7ae54ba60',
        prisonId: 'TST',
        code: 'A',
        pathHierarchy: 'A',
        locationType: 'WING',
        permanentlyInactive: false,
        accommodationTypes: ['TEST_TYPE'],
        specialistCellTypes: [],
        usedFor: [],
        status: 'ACTIVE',
        convertedCellType: 'OFFICE',
        active: true,
        deactivatedByParent: false,
        deactivatedReason: 'TEST_TYPE',
        proposedReactivationDate: '2024-04-28',
        planetFmReference: 'PFM/1234',
        topLevelId: '7995694d-d12b-4571-a9bb-4de01e1fe910',
        level: 1,
        leafLevel: false,
        parentId: '1a5ef7cc-2fb4-4df0-8688-f946e6db2f85',
        inactiveCells: 0,
        lastModifiedBy: 'LOCATION_RO',
        lastModifiedDate: new Date().toISOString(),
        key: 'LEI-A',
        sortName: 'A',
        isResidential: true,
        capacity: { maxCapacity: 100, workingCapacity: 94 },
      }
      const locationHierarchy = [
        {
          id: 'id1',
          prisonId: 'TST',
          code: '1',
          type: 'WING',
          pathHierarchy: '1',
          level: 1,
        },
      ]

      context('When the location is Active', () => {
        beforeEach(() => {
          location = LocationFactory.build({
            ...locationDetails,
            status: 'ACTIVE',
          })

          cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
            parentLocation: location,
            locationHierarchy,
          })
        })

        it('Correctly presents the API data', () => {
          testShow({ location, locationHierarchy })
        })
      })

      context('When the location is Inactive', () => {
        beforeEach(() => {
          location = LocationFactory.build({
            ...locationDetails,
            status: 'INACTIVE',
          })

          cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
            parentLocation: location,
            locationHierarchy,
          })
        })

        it('Correctly presents the API data', () => {
          testShow({ location, locationHierarchy })
        })
      })
    })

    context('When the location is a Landing', () => {
      const locationDetails = {
        id: 'b8813f47-4497-4c88-9dee-a8d7ae54ba60',
        prisonId: 'TST',
        code: '1',
        localName: 'Super Landing',
        pathHierarchy: 'A-1',
        locationType: 'LANDING',
        permanentlyInactive: false,
        accommodationTypes: ['TEST_TYPE'],
        specialistCellTypes: [],
        usedFor: [],
        status: 'ACTIVE',
        convertedCellType: 'OFFICE',
        active: true,
        deactivatedByParent: false,
        deactivatedReason: 'TEST_TYPE',
        proposedReactivationDate: '2024-04-28',
        planetFmReference: 'PFM/1234',
        topLevelId: '7995694d-d12b-4571-a9bb-4de01e1fe910',
        level: 2,
        leafLevel: false,
        parentId: '1a5ef7cc-2fb4-4df0-8688-f946e6db2f85',
        inactiveCells: 4,
        lastModifiedBy: 'LOCATION_RO',
        lastModifiedDate: new Date().toISOString(),
        key: 'LEI-A-1',
        sortName: 'A-1',
        isResidential: true,
        capacity: { maxCapacity: 20, workingCapacity: 14 },
      }
      const locationHierarchy = [
        {
          id: 'id1',
          prisonId: 'TST',
          code: '1',
          type: 'WING',
          pathHierarchy: '1',
          level: 1,
        },
        {
          id: 'id2',
          prisonId: 'TST',
          code: 'A',
          type: 'LANDING',
          localName: 'Super Landing',
          pathHierarchy: '1-A',
          level: 2,
        },
      ]

      context('When the location is Active', () => {
        beforeEach(() => {
          location = LocationFactory.build({
            ...locationDetails,
            status: 'ACTIVE',
          })

          cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
            parentLocation: location,
            locationHierarchy,
          })
        })

        it('Correctly presents the API data', () => {
          testShow({ location, locationHierarchy })
        })
      })

      context('When the location is Inactive', () => {
        beforeEach(() => {
          location = LocationFactory.build({
            ...locationDetails,
            status: 'INACTIVE',
          })

          cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
            parentLocation: location,
            locationHierarchy,
          })
        })

        it('Correctly presents the API data', () => {
          testShow({ location, locationHierarchy })
        })
      })
    })

    context('When the location is a Cell', () => {
      const locationDetails = {
        localName: null,
        id: 'b8813f47-4497-4c88-9dee-a8d7ae54ba60',
        prisonId: 'LEI',
        code: '001',
        pathHierarchy: 'A-1-001',
        locationType: 'CELL',
        permanentlyInactive: false,
        accommodationTypes: ['TEST_TYPE'],
        specialistCellTypes: ['ACCESSIBLE_CELL'],
        usedFor: [],
        status: 'ACTIVE',
        convertedCellType: 'OFFICE',
        active: true,
        deactivatedByParent: false,
        deactivatedReason: 'TEST_TYPE',
        proposedReactivationDate: '2024-04-28',
        planetFmReference: 'PFM/1234',
        topLevelId: '7995694d-d12b-4571-a9bb-4de01e1fe910',
        level: 3,
        leafLevel: true,
        parentId: '1a5ef7cc-2fb4-4df0-8688-f946e6db2f85',
        inactiveCells: 0,
        lastModifiedBy: 'LOCATION_RO',
        lastModifiedDate: new Date().toISOString(),
        key: 'LEI-A-1-001',
        sortName: 'A-1-001',
        isResidential: true,
        capacity: { maxCapacity: 2, workingCapacity: 1 },
      }
      const locationHierarchy = [
        {
          id: 'id1',
          prisonId: 'TST',
          code: '1',
          type: 'WING',
          pathHierarchy: '1',
          level: 1,
        },
        {
          id: 'id2',
          prisonId: 'TST',
          code: 'A',
          type: 'LANDING',
          localName: 'Landing A',
          pathHierarchy: '1-A',
          level: 2,
        },
        {
          id: 'id3',
          prisonId: 'TST',
          code: '001',
          type: 'CELL',
          pathHierarchy: '1-A-001',
          level: 3,
        },
      ]

      context('When the location is Active', () => {
        beforeEach(() => {
          location = LocationFactory.build({
            ...locationDetails,
            status: 'ACTIVE',
          })

          cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
            parentLocation: location,
            locationHierarchy,
          })
        })

        it('Correctly presents the API data', () => {
          testShow({ location, locationHierarchy })
        })
      })

      context('When the location is Inactive', () => {
        beforeEach(() => {
          location = LocationFactory.build({
            ...locationDetails,
            status: 'INACTIVE',
          })

          cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
            parentLocation: location,
            locationHierarchy,
          })
        })

        it('Correctly presents the API data', () => {
          testShow({ location, locationHierarchy })
        })
      })

      context('When the location is Non-residential', () => {
        beforeEach(() => {
          location = LocationFactory.build({
            ...locationDetails,
            status: 'NON_RESIDENTIAL',
          })

          cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
            parentLocation: location,
            locationHierarchy,
          })
        })

        it('Correctly presents the API data', () => {
          testShow({ location, locationHierarchy })
        })
      })
    })
  })
})
