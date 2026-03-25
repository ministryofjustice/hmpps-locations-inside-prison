import Page from '../../../../pages/page'
import ViewLocationsShowPage from '../../../../pages/viewLocations/show'
import DeactivateOccupiedPage from '../../../../pages/deactivate/occupied'
import CellCertChangePage from '../../../../pages/deactivate/cell-cert-change'
import AuthSignInPage from '../../../../pages/authSignIn'
import LocationsApiStubber from '../../../../mockApis/locationsApi'
import { setupStubs, location } from './setupStubs'

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
    beforeEach(() => {
      setupStubs('MANAGE_RES_LOCATIONS_OP_CAP')

      cy.signIn()
    })

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
        LocationsApiStubber.stub.stubPrisonerLocationsId(prisonerLocations)
      })

      it('displays the occupied page', () => {
        cy.visit(`/location/${location.id}/deactivate`)
        Page.verifyOnPage(DeactivateOccupiedPage)
      })
    })

    context('when the cell is not occupied', () => {
      it('displays the cell-cert-change page', () => {
        cy.visit(`/location/${location.id}/deactivate`)
        Page.verifyOnPage(CellCertChangePage)
      })
    })
  })
})
