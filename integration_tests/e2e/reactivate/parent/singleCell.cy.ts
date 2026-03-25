import LocationFactory from '../../../../server/testutils/factories/location'
import Page from '../../../pages/page'
import ReactivateParentSelectPage from '../../../pages/reactivate/parent/select'
import ViewLocationsShowPage from '../../../pages/viewLocations/show'
import ReactivateCellConfirmPage from '../../../pages/reactivate/cell/confirm'
import ReactivateCellDetailsPage from '../../../pages/reactivate/cell/details'

const createCell = (id: number) => {
  return LocationFactory.build({
    locationType: 'CELL',
    accommodationTypes: ['NORMAL_ACCOMMODATION'],
    leafLevel: true,
    specialistCellTypes: [],
    localName: undefined,
    status: 'INACTIVE',
    active: false,
    id: `inactiveCell${id}`,
    pathHierarchy: `A-1-00${id}`,
    parentId: '7e570000-0000-1000-8000-100000000000',
    oldWorkingCapacity: id,
    capacity: {
      maxCapacity: id + 2,
      workingCapacity: 0,
    },
  })
}

// This test file's main purpose is to test that single cell reactivation redirects to the correct pages (the referrer).
context('Reactivate cell (from reactivate parent)', () => {
  let locations: ReturnType<typeof LocationFactory.build>[]
  let inactiveLanding: ReturnType<typeof LocationFactory.build>
  let inactiveCell1: ReturnType<typeof LocationFactory.build>
  let inactiveCell2: ReturnType<typeof LocationFactory.build>
  let inactiveCell3: ReturnType<typeof LocationFactory.build>

  const genericLocation = LocationFactory.build({
    id: '57718979-573c-433a-9e51-2d83f887c11c',
    parentId: undefined,
    topLevelId: undefined,
  })

  const residentialSummary = {
    prisonSummary: {
      workingCapacity: 8,
      signedOperationalCapacity: 12,
      maxCapacity: 15,
    },
    subLocationName: 'TestWings',
    subLocations: [],
    topLevelLocationType: 'Wings',
    locationHierarchy: [],
  }

  const createLocations = () => {
    inactiveLanding = LocationFactory.build({
      locationType: 'LANDING',
      accommodationTypes: ['NORMAL_ACCOMMODATION'],
      leafLevel: false,
      specialistCellTypes: [],
      localName: undefined,
      status: 'INACTIVE',
      active: false,
      id: '7e570000-0000-1000-8000-100000000000',
      pathHierarchy: `A-1`,
      parentId: '57718979-573c-433a-9e51-2d83f887c11c',
    })
    inactiveCell1 = createCell(1)
    inactiveCell2 = createCell(2)
    inactiveCell3 = createCell(3)
    locations = [genericLocation, inactiveLanding, inactiveCell1, inactiveCell2, inactiveCell3]
  }

  context('without the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      createLocations()
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
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
        parentLocation: inactiveLanding,
        subLocations: [inactiveCell1, inactiveCell2, inactiveCell3],
      })
      cy.task('stubGetPrisonConfiguration', { prisonId: 'TST', certificationActive: 'INACTIVE' })
      cy.signIn()
    })

    it('does not show the reactivate buttons in the inactive location banner', () => {
      ViewLocationsShowPage.goTo(inactiveLanding.prisonId, inactiveLanding.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.inactiveBannerActivateEntireButton().should('not.exist')
      viewLocationsShowPage.inactiveBannerActivateIndividualButton().should('not.exist')
    })
  })

  context('with the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    let viewLocationsShowPage: ViewLocationsShowPage

    beforeEach(() => {
      createLocations()
      cy.task('reset')
      cy.task('stubSignIn', { roles: ['MANAGE_RES_LOCATIONS_OP_CAP'] })
      cy.task('stubManageUsers')
      cy.task('stubManageUsersMe')
      cy.task('stubManageUsersMeCaseloads')
      cy.task('stubLocationsConstantsAccommodationType')
      cy.task('stubLocationsConstantsConvertedCellType')
      cy.task('stubLocationsConstantsDeactivatedReason')
      cy.task('stubLocationsConstantsLocationType')
      cy.task('stubLocationsConstantsSpecialistCellType')
      cy.task('stubLocationsConstantsUsedForType')
      locations.forEach(location => cy.task('stubLocations', location))
      cy.task('stubLocationsBulkReactivate')
      cy.task('stubLocationsLocationsResidentialSummary', residentialSummary)
      locations.forEach(location => {
        const subLocations = locations.filter(l => l.parentId === location.id)
        cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
          parentLocation: location,
          subLocations,
          subLocationName: `${subLocations[0]?.locationType?.toLowerCase()?.replace(/^\w/, a => a.toUpperCase()) || 'subLocationName'}s`,
        })
      })
      cy.task('stubGetPrisonConfiguration', { prisonId: 'TST', certificationActive: 'INACTIVE' })
      cy.signIn()
      ViewLocationsShowPage.goTo(inactiveLanding.prisonId, inactiveLanding.id)
      viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
    })

    it('shows the reactivate buttons in the inactive location banner', () => {
      viewLocationsShowPage.inactiveBannerActivateEntireButton().should('exist')
      viewLocationsShowPage.inactiveBannerActivateIndividualButton().should('exist')
    })

    context('after clicking "Activate individual"', () => {
      let selectPage: ReactivateParentSelectPage
      beforeEach(() => {
        viewLocationsShowPage.inactiveBannerActivateIndividualButton().click()
        selectPage = Page.verifyOnPage(ReactivateParentSelectPage)
        cy.get('h1').contains('Activate individual cells')
      })

      context('after selecting a single cell', () => {
        let reactivateCellDetailsPage: ReactivateCellDetailsPage
        beforeEach(() => {
          selectPage.locationCheckboxItem('inactiveCell1').click()
          selectPage.continueButton().click()

          reactivateCellDetailsPage = Page.verifyOnPage(ReactivateCellDetailsPage)
        })

        it('has a back link to the select cells page', () => {
          reactivateCellDetailsPage.backLink().click()

          Page.verifyOnPage(ReactivateParentSelectPage)
          cy.get('h1').contains('Activate individual cells')
        })

        it('has the correct main heading and a caption showing the cell description', () => {
          cy.get('h1').contains('Check cell capacity')
          cy.get('.govuk-caption-m').contains('Cell A-1-001')
        })

        it('has a cancel link to the select cells page', () => {
          reactivateCellDetailsPage.cancelLink().click()

          Page.verifyOnPage(ReactivateParentSelectPage)
          cy.get('h1').contains('Activate individual cells')
        })

        describe('confirm cell capacity', () => {
          let reactivateCellConfirmPage: ReactivateCellConfirmPage
          beforeEach(() => {
            reactivateCellDetailsPage.workingCapacityInput().clear().type('2')
            reactivateCellDetailsPage.continueButton().click()

            reactivateCellConfirmPage = Page.verifyOnPage(ReactivateCellConfirmPage)
          })

          it('has the correct title', () => {
            cy.get('h1').contains('You are about to reactivate cell A-1-001')
          })

          it('has a cancel link to the select cells page', () => {
            reactivateCellConfirmPage.cancelLink().click()

            Page.verifyOnPage(ReactivateParentSelectPage)
            cy.get('h1').contains('Activate individual cells')
          })

          it('redirects back to the referring page and shows the success banner when the change is complete', () => {
            reactivateCellConfirmPage.confirmButton().click()

            Page.verifyOnPage(ViewLocationsShowPage)
            cy.title().should('eq', 'Landing A-1 - Manage residential locations - Residential locations')

            cy.get('#govuk-notification-banner-title').contains('Success')
            cy.get('.govuk-notification-banner__content h3').contains('Cell activated')
            cy.get('.govuk-notification-banner__content p').contains('You have activated cell A-1-001.')
          })
        })
      })
    })
  })
})
