import LocationFactory from '../../../../server/testutils/factories/location'
import Page from '../../../pages/page'
import ReactivateCellDetailsPage from '../../../pages/reactivate/cell/details'
import ReactivateCellConfirmPage from '../../../pages/reactivate/cell/confirm'
import InactiveCellsIndexPage from '../../../pages/inactiveCells'
import ManageUsersApiStubber from '../../../mockApis/manageUsersApi'
import AuthStubber from '../../../mockApis/auth'
import LocationsApiStubber from '../../../mockApis/locationsApi'
import PrisonResidentialSummaryFactory from '../../../../server/testutils/factories/prisonResidentialSummary'

// This test file's main purpose is to test that single cell reactivation redirects to the correct pages (the referrer).
context('Reactivate cell (from reactivate cells)', () => {
  let locations: ReturnType<typeof LocationFactory.build>[]
  let inactiveParent: ReturnType<typeof LocationFactory.build>
  let inactiveParentParent: ReturnType<typeof LocationFactory.build>

  const genericLocation = LocationFactory.build({
    id: '57718979-573c-433a-9e51-2d83f887c11c',
    parentId: undefined,
    topLevelId: undefined,
  })

  const residentialSummary = PrisonResidentialSummaryFactory.build({
    prisonSummary: {
      workingCapacity: 8,
      signedOperationalCapacity: 12,
      maxCapacity: 15,
    },
    subLocationName: 'TestWings',
    subLocations: [],
    topLevelLocationType: 'Wings',
    locationHierarchy: [],
  })

  const createLocations = () => {
    locations = [
      LocationFactory.build({
        accommodationTypes: ['NORMAL_ACCOMMODATION'],
        capacity: {
          maxCapacity: 3,
          workingCapacity: 0,
        },
        oldWorkingCapacity: 2,
        leafLevel: true,
        specialistCellTypes: [],
        localName: undefined,
        status: 'INACTIVE',
        active: false,
        id: '7e570000-0000-000a-0001-000000000001',
        pathHierarchy: 'A-1-001',
      }),
      LocationFactory.build({
        accommodationTypes: ['NORMAL_ACCOMMODATION'],
        capacity: {
          maxCapacity: 1,
          workingCapacity: 0,
        },
        oldWorkingCapacity: 1,
        leafLevel: true,
        specialistCellTypes: [],
        localName: undefined,
        status: 'INACTIVE',
        active: false,
        id: '7e570000-0000-000a-0001-000000000002',
        pathHierarchy: 'A-1-002',
        parentId: '7e570000-0000-1000-8000-100000000000',
      }),
      LocationFactory.build({
        accommodationTypes: ['NORMAL_ACCOMMODATION'],
        capacity: {
          maxCapacity: 4,
          workingCapacity: 0,
        },
        oldWorkingCapacity: 3,
        leafLevel: true,
        specialistCellTypes: [],
        localName: undefined,
        status: 'INACTIVE',
        active: false,
        id: '7e570000-0000-000a-0001-000000000003',
        pathHierarchy: 'A-1-003',
        parentId: '7e570000-0000-1000-8000-100000000000',
      }),
      LocationFactory.build({
        accommodationTypes: ['NORMAL_ACCOMMODATION'],
        capacity: {
          maxCapacity: 2,
          workingCapacity: 0,
        },
        oldWorkingCapacity: 2,
        leafLevel: true,
        specialistCellTypes: [],
        localName: undefined,
        status: 'INACTIVE',
        active: false,
        id: '7e570000-0000-000a-0001-000000000004',
        pathHierarchy: 'A-1-004',
      }),
    ]
    inactiveParent = LocationFactory.build({
      locationType: 'LANDING',
      accommodationTypes: ['NORMAL_ACCOMMODATION'],
      leafLevel: false,
      specialistCellTypes: [],
      localName: 'Inactive Parent',
      status: 'INACTIVE',
      active: false,
      id: '7e570000-0000-1000-8000-100000000000',
      pathHierarchy: 'A-1',
      parentId: 'inactiveParentParent',
    })
    inactiveParentParent = LocationFactory.build({
      locationType: 'WING',
      accommodationTypes: ['NORMAL_ACCOMMODATION'],
      leafLevel: false,
      specialistCellTypes: [],
      localName: undefined,
      status: 'INACTIVE',
      active: false,
      id: 'inactiveParentParent',
      pathHierarchy: 'A',
    })
  }

  context('without the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      createLocations()
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
      LocationsApiStubber.stub.stubLocationsPrisonInactiveCellsForLocation(locations)
      LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({
        parentLocation: inactiveParent,
        subLocations: locations,
      })
      LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'INACTIVE' })
      cy.signIn()
    })

    it('does not show the checkboxes on the inactive cells page', () => {
      InactiveCellsIndexPage.goTo('TST', '7e570000-0000-1000-8000-100000000000')
      const page = Page.verifyOnPage(InactiveCellsIndexPage)

      page.selectAllCheckbox().should('not.exist')
      page.footer().should('not.exist')
    })
  })

  context('with the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      createLocations()
      cy.task('reset')
      AuthStubber.stub.stubSignIn({ roles: ['MANAGE_RES_LOCATIONS_OP_CAP'] })
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
      LocationsApiStubber.stub.stubLocationsPrisonInactiveCellsForLocation(locations)
      LocationsApiStubber.stub.stubLocationsLocationsResidentialSummaryForLocation({
        parentLocation: inactiveParent,
        subLocations: locations,
      })
      LocationsApiStubber.stub.stubGetPrisonConfiguration({ prisonId: 'TST', certificationActive: 'INACTIVE' })
      ;[...locations, inactiveParent, inactiveParentParent, genericLocation].forEach(
        LocationsApiStubber.stub.stubLocations,
      )
      LocationsApiStubber.stub.stubLocationsBulkReactivate()
      LocationsApiStubber.stub.stubLocationsLocationsResidentialSummary(residentialSummary)
      cy.signIn()
    })

    describe('when only 1 location is selected', () => {
      let reactivateCellDetailsPage: ReactivateCellDetailsPage
      beforeEach(() => {
        InactiveCellsIndexPage.goTo('TST', '7e570000-0000-1000-8000-100000000000')
        const page = Page.verifyOnPage(InactiveCellsIndexPage)
        // wait for js to load
        cy.get('body.jquery-loaded').should('exist')
        page.selectCheckbox(locations[2].id).click({ force: true })
        page.footerSubmit().click()

        reactivateCellDetailsPage = Page.verifyOnPage(ReactivateCellDetailsPage)
      })

      it('has a back link to the inactive cells page', () => {
        reactivateCellDetailsPage.backLink().click()

        Page.verifyOnPage(InactiveCellsIndexPage)
        cy.title().should('eq', 'Inactive Parent - Inactive cells - Residential locations')
      })

      it('has the correct main heading and a caption showing the cell description', () => {
        cy.get('h1').contains('Check cell capacity')
        cy.get('.govuk-caption-m').contains('Cell A-1-003')
      })

      it('has a cancel link to the inactive cells page', () => {
        reactivateCellDetailsPage.cancelLink().click()

        Page.verifyOnPage(InactiveCellsIndexPage)
        cy.title().should('eq', 'Inactive Parent - Inactive cells - Residential locations')
      })

      describe('confirm cell capacity', () => {
        let reactivateCellConfirmPage: ReactivateCellConfirmPage
        beforeEach(() => {
          reactivateCellDetailsPage.workingCapacityInput().clear().type('2')
          reactivateCellDetailsPage.continueButton().click()

          reactivateCellConfirmPage = Page.verifyOnPage(ReactivateCellConfirmPage)
        })

        it('has the correct title', () => {
          cy.get('h1').contains('You are about to reactivate cell A-1-003')
        })

        it('has a cancel link to the inactive cells page', () => {
          reactivateCellConfirmPage.cancelLink().click()

          Page.verifyOnPage(InactiveCellsIndexPage)
          cy.title().should('eq', 'Inactive Parent - Inactive cells - Residential locations')
        })

        it('redirects back to the referring page and shows the success banner when the change is complete', () => {
          reactivateCellConfirmPage.confirmButton().click()

          Page.verifyOnPage(InactiveCellsIndexPage)
          cy.title().should('eq', 'Inactive Parent - Inactive cells - Residential locations')

          cy.get('#govuk-notification-banner-title').contains('Success')
          cy.get('.govuk-notification-banner__content h3').contains('Cell activated')
          cy.get('.govuk-notification-banner__content p').contains('You have activated cell A-1-003.')
        })
      })
    })
  })
})
