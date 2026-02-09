import Page from '../../../../pages/page'
import ViewLocationsShowPage from '../../../../pages/viewLocations/show'
import DeactivateOccupiedPage from '../../../../pages/deactivate/occupied'
import { setupStubs, location } from './setupStubs'
import PrisonerFactory from '../../../../../server/testutils/factories/prisoner'
import LocationsApiStubber from '../../../../mockApis/locationsApi'

context('Certification Deactivation - Cell - Occupied', () => {
  let cellOccupiedPage: DeactivateOccupiedPage

  beforeEach(() => {
    setupStubs('MANAGE_RES_LOCATIONS_OP_CAP')
    const prisonerLocations = [
      {
        cellLocation: 'A-1-001',
        prisoners: [PrisonerFactory.build()],
      },
    ]
    LocationsApiStubber.stub.stubPrisonerLocationsId(prisonerLocations)

    cy.signIn()
    cy.visit(`/location/${location.id}/deactivate`)
    cellOccupiedPage = Page.verifyOnPage(DeactivateOccupiedPage)
  })

  it('has a caption showing the display name', () => {
    cy.get('.govuk-caption-m').contains('Cell A-1-001')
  })

  it('shows the correct error message', () => {
    cy.contains('You need to move everyone out of this location before you can deactivate it.')
  })

  it('has a cancel link', () => {
    cellOccupiedPage.cancelLink().click()

    Page.verifyOnPage(ViewLocationsShowPage)
  })
})
