import AuthSignInPage from '../../pages/authSignIn'
import Page from '../../pages/page'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import { Location, LocationSummary } from '../../../server/data/types/locationsApi'
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
      cy.task('stubGetPrisonConfiguration', { prisonId: 'TST', certificationActive: true })
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

      ViewLocationsShowPage.goTo(location.prisonId, location.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      cy.get('h1').contains(location.localName || location.pathHierarchy)
      viewLocationsShowPage
        .locationType()
        .contains(location.locationType.toLowerCase().replace(/^\w/, a => a.toUpperCase()))
      viewLocationsShowPage
        .certifiedTag()
        .should(`${location.leafLevel && location.certification.certified ? '' : 'not.'}exist`)
      const statusTag =
        location.status === 'DRAFT' || location.status === 'LOCKED_DRAFT'
          ? 'Draft'
          : location.status
              .replace(/_/, '-')
              .toLowerCase()
              .replace(/^\w/, a => a.toUpperCase())

      viewLocationsShowPage.statusTag().contains(statusTag)

      validateBreadcrumbs(viewLocationsShowPage, locationHierarchy)

      if (location.status === 'INACTIVE') {
        viewLocationsShowPage.inactiveBanner().should('exist')
        viewLocationsShowPage.inactiveBannerRows().should('have.length', 3)
        viewLocationsShowPage.inactiveBannerRows().eq(0).find('.govuk-summary-list__key').contains('Reason')
        viewLocationsShowPage.inactiveBannerRows().eq(0).find('.govuk-summary-list__value').contains('Test type 1')
        viewLocationsShowPage
          .inactiveBannerRows()
          .eq(1)
          .find('.govuk-summary-list__key')
          .contains('Estimated reactivation date')
        viewLocationsShowPage
          .inactiveBannerRows()
          .eq(1)
          .find('.govuk-summary-list__value')
          .contains(formatDate(location.proposedReactivationDate || 'Not provided'))
        viewLocationsShowPage
          .inactiveBannerRows()
          .eq(2)
          .find('.govuk-summary-list__key')
          .contains('Planet FM reference number')
        viewLocationsShowPage
          .inactiveBannerRows()
          .eq(2)
          .find('.govuk-summary-list__value')
          .contains(location.planetFmReference || 'Not provided')
      } else {
        viewLocationsShowPage.inactiveBanner().should('not.exist')
      }

      if (location.status === 'DRAFT') {
        viewLocationsShowPage.draftBanner().should('exist')

        viewLocationsShowPage.draftBannerCertifyButton().should('not.exist')
      } else if (location.status === 'LOCKED_DRAFT') {
        viewLocationsShowPage.draftBanner().should('exist')

        viewLocationsShowPage
          .draftBannerCertifyLinkButton()
          .should('exist')
          .should('have.attr', 'href', `/TST/cell-certificate/change-requests/${location.pendingApprovalRequestId}`)
          .contains('View request details')
      } else {
        viewLocationsShowPage.draftBanner().should('not.exist')
      }

      if (location.status === 'NON_RESIDENTIAL') {
        viewLocationsShowPage.summaryCards.all().should('have.length', 0)
      } else {
        viewLocationsShowPage.summaryCards.all().should('have.length', location.leafLevel ? 2 : 3)
        if (location.status === 'DRAFT') {
          viewLocationsShowPage.summaryCards
            .cnaText()
            .contains(`${location.numberOfCellLocations > 0 ? location.certification.capacityOfCertifiedCell : '-'}`)
          viewLocationsShowPage.summaryCards
            .workingCapacityText()
            .contains(`${location.numberOfCellLocations > 0 ? location.capacity.workingCapacity : '-'}`)
          viewLocationsShowPage.summaryCards
            .maximumCapacityText()
            .contains(`${location.numberOfCellLocations > 0 ? location.capacity.maxCapacity : '-'}`)
        } else {
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
          .contains('Normal accommodation')
        detailsRows += 1

        viewLocationsShowPage
          .locationDetailsRows()
          .eq(detailsRows)
          .find('.govuk-summary-list__key')
          .contains('Used for')
        viewLocationsShowPage
          .locationDetailsRows()
          .eq(detailsRows)
          .find('.govuk-summary-list__value')
          .contains(location.usedFor.length ? 'Close Supervision Centre (CSC)' : '-')
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

      viewLocationsShowPage.locationDetailsRows().should('have.length', detailsRows)

      if (subLocations.length) {
        viewLocationsShowPage.locationsTable().should('exist')
      } else {
        viewLocationsShowPage.locationsTable().should('not.exist')
      }
    }

    let location: Location

    context('When the location is a Wing', () => {
      const locationDetails: Partial<Location> = {
        localName: null,
        id: 'b8813f47-4497-4c88-9dee-a8d7ae54ba60',
        prisonId: 'TST',
        code: 'A',
        pathHierarchy: 'A',
        locationType: 'WING',
        permanentlyInactive: false,
        accommodationTypes: ['NORMAL_ACCOMMODATION'],
        specialistCellTypes: [],
        usedFor: [],
        status: 'ACTIVE',
        convertedCellType: 'OFFICE',
        active: true,
        deactivatedByParent: false,
        deactivatedReason: 'TEST1',
        proposedReactivationDate: '2024-04-28',
        planetFmReference: 'PFM/1234',
        topLevelId: '7995694d-d12b-4571-a9bb-4de01e1fe910',
        level: 1,
        leafLevel: false,
        parentId: '1a5ef7cc-2fb4-4df0-8688-f946e6db2f85',
        inactiveCells: 0,
        lastModifiedBy: 'LOCATION_RO',
        lastModifiedDate: new Date().toISOString(),
        key: 'TST-A',
        sortName: 'A',
        isResidential: true,
        capacity: { maxCapacity: 100, workingCapacity: 94 },
        numberOfCellLocations: 4,
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

        describe('Deactivate button', () => {
          before(() => {
            cy.task('stubSignIn', {
              roles: ['MANAGE_RESIDENTIAL_LOCATIONS', 'MANAGE_RES_LOCATIONS_OP_CAP'],
            })
            cy.signIn()
          })

          it('Shows the Deactivate landing button if actions are provided', () => {
            ViewLocationsShowPage.goTo(location.prisonId, location.id)
            Page.verifyOnPage(ViewLocationsShowPage)
            cy.get('.govuk-button').contains('Deactivate wing')
          })
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

      context('When the location is Draft', () => {
        context('When numberOfCellLocations is 0', () => {
          beforeEach(() => {
            location = LocationFactory.build({
              ...locationDetails,
              status: 'DRAFT',
              numberOfCellLocations: 0,
            })

            cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
              parentLocation: location,
              locationHierarchy,
            })

            cy.task(
              'stubLocations',
              LocationFactory.build({
                parentId: undefined,
                id: location.parentId,
                status: 'ACTIVE',
              }),
            )
          })

          it('Correctly presents the API data', () => {
            testShow({ location, locationHierarchy })
          })
        })

        context('When numberOfCellLocations is 1', () => {
          beforeEach(() => {
            location = LocationFactory.build({
              ...locationDetails,
              status: 'DRAFT',
              numberOfCellLocations: 1,
            })

            cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
              parentLocation: location,
              locationHierarchy,
            })

            cy.task(
              'stubLocations',
              LocationFactory.build({
                parentId: undefined,
                id: location.parentId,
                status: 'ACTIVE',
              }),
            )
          })

          it('Correctly presents the API data', () => {
            testShow({ location, locationHierarchy })
          })
        })
      })

      context('When the location is Locked Draft', () => {
        beforeEach(() => {
          location = LocationFactory.build({
            ...locationDetails,
            status: 'LOCKED_DRAFT',
            pendingApprovalRequestId: 'REQUEST-ID-0000-1000',
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
      const locationDetails: Partial<Location> = {
        id: 'b8813f47-4497-4c88-9dee-a8d7ae54ba60',
        prisonId: 'TST',
        code: '1',
        localName: 'Super Landing',
        pathHierarchy: 'A-1',
        locationType: 'LANDING',
        permanentlyInactive: false,
        accommodationTypes: ['NORMAL_ACCOMMODATION'],
        specialistCellTypes: [],
        usedFor: [],
        status: 'ACTIVE',
        convertedCellType: 'OFFICE',
        active: true,
        deactivatedByParent: false,
        deactivatedReason: 'TEST1',
        proposedReactivationDate: '2024-04-28',
        planetFmReference: 'PFM/1234',
        topLevelId: '7995694d-d12b-4571-a9bb-4de01e1fe910',
        level: 2,
        leafLevel: false,
        parentId: '1a5ef7cc-2fb4-4df0-8688-f946e6db2f85',
        inactiveCells: 4,
        lastModifiedBy: 'LOCATION_RO',
        lastModifiedDate: new Date().toISOString(),
        key: 'TST-A-1',
        sortName: 'A-1',
        isResidential: true,
        capacity: { maxCapacity: 20, workingCapacity: 14 },
        numberOfCellLocations: 4,
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

        describe('Deactivate button', () => {
          before(() => {
            cy.task('stubSignIn', {
              roles: ['MANAGE_RESIDENTIAL_LOCATIONS', 'MANAGE_RES_LOCATIONS_OP_CAP'],
            })
            cy.signIn()
          })

          it('Shows the Deactivate landing button if actions are provided', () => {
            ViewLocationsShowPage.goTo(location.prisonId, location.id)
            Page.verifyOnPage(ViewLocationsShowPage)
            cy.get('.govuk-button').contains('Deactivate landing')
          })
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
      const locationDetails: Partial<Location> = {
        localName: null,
        id: 'b8813f47-4497-4c88-9dee-a8d7ae54ba60',
        prisonId: 'TST',
        code: '001',
        pathHierarchy: 'A-1-001',
        locationType: 'CELL',
        permanentlyInactive: false,
        accommodationTypes: ['NORMAL_ACCOMMODATION'],
        specialistCellTypes: ['ACCESSIBLE_CELL'],
        usedFor: [],
        status: 'ACTIVE',
        convertedCellType: 'OFFICE',
        active: true,
        deactivatedByParent: false,
        deactivatedReason: 'TEST1',
        proposedReactivationDate: '2024-04-28',
        planetFmReference: 'PFM/1234',
        topLevelId: '7995694d-d12b-4571-a9bb-4de01e1fe910',
        level: 3,
        leafLevel: true,
        parentId: '1a5ef7cc-2fb4-4df0-8688-f946e6db2f85',
        inactiveCells: 0,
        lastModifiedBy: 'LOCATION_RO',
        lastModifiedDate: new Date().toISOString(),
        key: 'TST-A-1-001',
        sortName: 'A-1-001',
        isResidential: true,
        capacity: { maxCapacity: 2, workingCapacity: 1 },
        numberOfCellLocations: 1,
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

        describe('Actions button', () => {
          context('when the map2380 feature flag is disabled', () => {
            beforeEach(() => {
              cy.task('setFeatureFlag', { map2380: false })
            })

            before(() => {
              cy.task('stubSignIn', {
                roles: ['MANAGE_RESIDENTIAL_LOCATIONS', 'MANAGE_RES_LOCATIONS_OP_CAP'],
              })
              cy.signIn()
            })

            it('shows the actions menu', () => {
              ViewLocationsShowPage.goTo(location.prisonId, location.id)
              Page.verifyOnPage(ViewLocationsShowPage)
              cy.get('.moj-button-menu').should('exist')
            })
          })

          context('when the map2380 feature flag is enabled', () => {
            beforeEach(() => {
              cy.task('setFeatureFlag', { map2380: true })
            })

            context('when the user has MANAGE_RESIDENTIAL_LOCATIONS role', () => {
              before(() => {
                cy.task('stubSignIn', {
                  roles: ['MANAGE_RESIDENTIAL_LOCATIONS'],
                })
                cy.signIn()
              })

              it('does not show the actions menu', () => {
                ViewLocationsShowPage.goTo(location.prisonId, location.id)
                Page.verifyOnPage(ViewLocationsShowPage)
                cy.get('.moj-button-menu').should('not.exist')
              })
            })

            context('when the user has MANAGE_RES_LOCATIONS_OP_CAP role', () => {
              before(() => {
                cy.task('stubSignIn', {
                  roles: ['MANAGE_RESIDENTIAL_LOCATIONS', 'MANAGE_RES_LOCATIONS_OP_CAP'],
                })
                cy.signIn()
              })

              it('shows the actions menu', () => {
                ViewLocationsShowPage.goTo(location.prisonId, location.id)
                Page.verifyOnPage(ViewLocationsShowPage)
                cy.get('.moj-button-menu').should('exist')
              })
            })
          })
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

      context('When the location is Inactive without deactivation details', () => {
        beforeEach(() => {
          location = LocationFactory.build({
            ...locationDetails,
            status: 'INACTIVE',
            proposedReactivationDate: undefined,
            planetFmReference: '',
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
  //   TODO: Add tests for different roles (buttons/banners displayed) and for when locations are locked (draft requested) / unlocked
})
