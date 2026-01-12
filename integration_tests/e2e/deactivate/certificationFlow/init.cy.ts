import LocationFactory from '../../../../server/testutils/factories/location'
import Page from '../../../pages/page'
import ViewLocationsShowPage from '../../../pages/viewLocations/show'
import DeactivateOccupiedPage from '../../../pages/deactivate/occupied'
import DeactivateTemporaryDetailsPage from '../../../pages/deactivate/temporary/details'
import CellCertChangePage from '../../../pages/deactivate/cell-cert-change'

context('Certification Deactivation - Cell', () => {
  const location = LocationFactory.build({
    accommodationTypes: ['NORMAL_ACCOMMODATION'],
    capacity: {
      maxCapacity: 2,
      workingCapacity: 1,
    },
    leafLevel: true,
    localName: null,
    specialistCellTypes: ['ACCESSIBLE_CELL', 'CONSTANT_SUPERVISION'],
  })

  beforeEach(() => {
    cy.task('reset')
  })

  context('without the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
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
      cy.task('stubLocationsLocationsResidentialSummary', {
        prisonSummary: {
          workingCapacity: 9,
          signedOperationalCapacity: 11,
          maxCapacity: 10,
        },
      })
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
        parentLocation: location,
      })
      cy.task('stubLocations', location)
      cy.task('stubGetPrisonConfiguration', { prisonId: 'TST', certificationActive: 'ACTIVE' })
      cy.signIn()
    })

    it('does not show the action in the menu on the show location page', () => {
      ViewLocationsShowPage.goTo(location.prisonId, location.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.deactivateAction().should('not.exist')
    })
  })

  context('with the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
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
      cy.task('stubLocationsLocationsResidentialSummary', {
        prisonSummary: {
          workingCapacity: 9,
          signedOperationalCapacity: 11,
          maxCapacity: 10,
        },
      })
      cy.task('stubLocationsLocationsResidentialSummaryForLocation', {
        parentLocation: location,
      })
      cy.task('stubLocations', location)
      cy.task('stubPrisonerLocationsId', [])
      cy.task('stubLocationsDeactivateTemporary')
      cy.task('stubGetPrisonConfiguration', { prisonId: 'TST', certificationActive: 'ACTIVE' })

      cy.signIn()
    })

    function itDisplaysTheCellOccupiedPage() {
      it('has a caption showing the cell description', () => {
        Page.verifyOnPage(DeactivateOccupiedPage)
        cy.get('.govuk-caption-m').contains('Cell A-1-001')
      })

      it('shows the correct error message', () => {
        Page.verifyOnPage(DeactivateOccupiedPage)
        cy.contains('You need to move everyone out of this location before you can deactivate it.')
      })

      it('has a cancel link', () => {
        const cellOccupiedPage = Page.verifyOnPage(DeactivateOccupiedPage)
        cellOccupiedPage.cancelLink().click()

        Page.verifyOnPage(ViewLocationsShowPage)
      })
    }

    context('when the cell is occupied', () => {
      beforeEach(() => {
        const prisonerLocations = [
          {
            cellLocation: 'A-1-001',
            prisoners: [
              {
                prisonerNumber: 'A1234AA',
                prisonId: 'TST',
                prisonName: 'HMP Leeds',
                cellLocation: 'A-1-001',
                firstName: 'Dave',
                lastName: 'Jones',
                gender: 'Male',
                csra: 'High',
                category: 'C',
                alerts: [
                  {
                    alertType: 'X',
                    alertCode: 'XA',
                    active: true,
                    expired: false,
                  },
                ],
              },
            ],
          },
        ]
        cy.task('stubPrisonerLocationsId', prisonerLocations)
        DeactivateTemporaryDetailsPage.goTo('7e570000-0000-0000-0000-000000000001')
      })

      itDisplaysTheCellOccupiedPage()
    })

    context('when the cell is not occupied', () => {
      it('displays the cell-cert-change page', () => {
        cy.visit(`/location/${location.id}/deactivate`)
        Page.verifyOnPage(CellCertChangePage)
      })
    })
  })
})
