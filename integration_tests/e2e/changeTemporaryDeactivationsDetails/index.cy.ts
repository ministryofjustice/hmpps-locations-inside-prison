import LocationFactory from '../../../server/testutils/factories/location'
import Page from '../../pages/page'
import InactiveCellsIndexPage from '../../pages/inactiveCells/index'
import ResidentialSummaryPage from '../../pages/viewLocations/show'
import ChangeTemporaryDeactivationDetailsPage from '../../pages/changeTemporaryDeactivationDetails/details'
import AuthSignInPage from '../../pages/authSignIn'
import IndexPage from '../../pages/index'
import { Location } from '../../../server/data/types/locationsApi'

context('Change temporary deactivations details', () => {
  context('Without the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
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
    })
    let locations: Location[]

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
            deactivationReasonDescription: 'TEST2',
            proposedReactivationDate: new Date(2024, 1, 3).toISOString(),
            planetFmReference: 'FM-1133',
          }),
        ]
        cy.task('stubLocationsPrisonInactiveCells', locations)
      })

      it('Correctly presents the API data for a location', () => {
        cy.signIn()
        const indexPage = Page.verifyOnPage(IndexPage)
        indexPage.cards.inactiveCells().click()
        const inactiveCellsIndexPage = Page.verifyOnPage(InactiveCellsIndexPage)

        const singleLocation = {
          topLevelLocationType: 'Wings',
          locationHierarchy: [],
          parentLocation: {
            id: '74a5ea0a-5457-4028-b5eb-0a32daf25546',
            prisonId: 'TST',
            code: '005',
            pathHierarchy: 'B-1-001',
            locationType: 'CELL',
            permanentlyInactive: false,
            capacity: {
              maxCapacity: 2,
              workingCapacity: 0,
            },
            oldWorkingCapacity: 0,
            certification: {
              certified: true,
              capacityOfCertifiedCell: 2,
            },
            accommodationTypes: ['NORMAL_ACCOMMODATION'],
            specialistCellTypes: [],
            usedFor: ['STANDARD_ACCOMMODATION'],
            status: 'INACTIVE',
            active: false,
            deactivatedByParent: false,
            deactivatedDate: '2024-10-02T09:10:39',
            deactivatedReason: 'PEST',
            deactivationReasonDescription: 'Bed bugs',
            deactivatedBy: 'ITAG_USER',
            proposedReactivationDate: '2024-11-21',
            planetFmReference: 'PFM-005',
            leafLevel: true,
            lastModifiedBy: 'ITAG_USER',
            lastModifiedDate: '2024-10-02T09:10:39',
            key: 'TST-A-1-005',
            isResidential: true,
          },
          subLocations: [],
        }
        cy.task('stubLocationsLocationsResidentialSummaryForLocation', singleLocation)
        inactiveCellsIndexPage.getFirstRow().click()

        const residentialSummaryPage = Page.verifyOnPage(ResidentialSummaryPage)
        cy.task('stubLocationsChangeTemporaryDeactivationDetails', singleLocation)

        cy.task('stubPrisonerLocationsId', [])

        const locationObj = {
          id: '74a5ea0a-5457-4028-b5eb-0a32daf25546',
          prisonId: 'TST',
          code: '005',
          pathHierarchy: 'A-1-001',
          locationType: 'CELL',
          permanentlyInactive: false,
          capacity: {
            maxCapacity: 2,
            workingCapacity: 0,
          },
          oldWorkingCapacity: 0,
          certification: {
            certified: true,
            capacityOfCertifiedCell: 2,
          },
          accommodationTypes: ['NORMAL_ACCOMMODATION'],
          specialistCellTypes: [],
          usedFor: ['STANDARD_ACCOMMODATION'],
          status: 'INACTIVE',
          active: false,
          deactivatedByParent: false,
          deactivatedDate: '2024-10-03T09:18:58',
          deactivatedReason: 'TEST1',
          deactivationReasonDescription: 'Bed bugs',
          deactivatedBy: 'ITAG_USER',
          proposedReactivationDate: '2024-11-22',
          planetFmReference: '123005',
          topLevelId: '5d597e0b-e350-40bc-bc05-2af159ffa15b',
          level: 3,
          leafLevel: true,
          parentId: 'e53902e1-eab8-4eae-b30f-f6f835f06956',
          lastModifiedBy: 'ITAG_USER',
          lastModifiedDate: '2024-10-03T09:18:58',
          key: 'LEI-A-1-005',
          isResidential: true,
        }

        cy.task('stubLocations', locationObj)

        residentialSummaryPage.inactiveBannerChangeLink().click()
        // const changeTemporaryDeactivationDetailsPage = Page.verifyOnPage(ChangeTemporaryDeactivationDetailsPage)
      })
    })
  })
})
