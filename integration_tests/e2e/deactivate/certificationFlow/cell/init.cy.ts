import Page from '../../../../pages/page'
import ViewLocationsShowPage from '../../../../pages/viewLocations/show'
import DeactivateOccupiedPage from '../../../../pages/deactivate/occupied'
import CellCertChangePage from '../../../../pages/deactivate/cell-cert-change'
import AuthSignInPage from '../../../../pages/authSignIn'
import LocationsApiStubber from '../../../../mockApis/locationsApi'
import { setupStubs, location } from './setupStubs'
import DeactivateTemporaryDetailsPage from '../../../../pages/deactivate/temporary/details'

context('Certification Deactivation - Cell - Init', () => {
  context('without the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs('RESI__CERT_VIEWER')

      cy.signIn()
    })

    it('does not show the action in the menu on the show location page', () => {
      ViewLocationsShowPage.goTo(location.prisonId, location.id)
      const viewLocationsShowPage = Page.verifyOnPage(ViewLocationsShowPage)
      viewLocationsShowPage.deactivateAction().should('not.exist')
    })

    it('redirects user to sign in page when visited directly', () => {
      cy.visit(`/location/${location.id}/deactivate`)
      Page.verifyOnPage(AuthSignInPage)
    })
  })

  context('with the MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    context('when the cell is occupied', () => {
      beforeEach(() => {
        setupStubs('MANAGE_RES_LOCATIONS_OP_CAP')

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
        LocationsApiStubber.stub.stubPrisonerLocationsId(prisonerLocations)

        cy.signIn()
      })

      it('displays the occupied page', () => {
        cy.visit(`/location/${location.id}/deactivate`)
        Page.verifyOnPage(DeactivateOccupiedPage)
      })
    })

    context('when the cell is not occupied', () => {
      context('when the cell has 0 working capacity', () => {
        beforeEach(() => {
          setupStubs('MANAGE_RES_LOCATIONS_OP_CAP', {
            ...location,
            capacity: { ...location.capacity, workingCapacity: 0 },
          })

          cy.signIn()
        })

        it('navigates to the temporary/details page', () => {
          cy.visit(`/location/${location.id}/deactivate`)
          Page.verifyOnPage(DeactivateTemporaryDetailsPage)
        })
      })

      context('when the cell has > 0 working capacity', () => {
        beforeEach(() => {
          setupStubs('MANAGE_RES_LOCATIONS_OP_CAP')

          cy.signIn()
        })

        it('navigates to the cell-cert-change page', () => {
          cy.visit(`/location/${location.id}/deactivate`)
          Page.verifyOnPage(CellCertChangePage)
        })
      })
    })
  })
})
