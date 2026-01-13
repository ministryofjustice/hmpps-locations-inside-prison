import LocationFactory from '../../../../server/testutils/factories/location'
import Page from '../../../pages/page'
import ViewLocationsShowPage from '../../../pages/viewLocations/show'
import DeactivateOccupiedPage from '../../../pages/deactivate/occupied'
import setupStubs from './setupStubs'

context('Certification Deactivation - Cell - Occupied', () => {
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
  let cellOccupiedPage: DeactivateOccupiedPage

  beforeEach(() => {
    setupStubs('MANAGE_RES_LOCATIONS_OP_CAP', location)
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

    cy.signIn()
    cy.visit(`/location/${location.id}/deactivate`)
    cellOccupiedPage = Page.verifyOnPage(DeactivateOccupiedPage)
  })

  it('has a caption showing the cell description', () => {
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
