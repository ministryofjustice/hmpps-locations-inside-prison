import { cellWithMaxCapacityMismatch, setupStubs } from './setupStubs'
import LocationsApiStubber from '../../mockApis/locationsApi'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import Page from '../../pages/page'
import WorkingCapacityMismatchConfirm from '../../pages/workingCapacityMismatch/confirm'
import goToConfirm from './goToConfirm'
import WorkingCapacityMismatchDetails from '../../pages/workingCapacityMismatch/details'

context('Working Capacity Mismatch - Confirm', () => {
  let page: WorkingCapacityMismatchConfirm
  beforeEach(() => {
    setupStubs('MANAGE_RES_LOCATIONS_OP_CAP')
    page = goToConfirm()
  })

  it('shows the new working capacity and shows a success banner on submit', () => {
    page.saveButton().click()
    Page.verifyOnPage(ViewLocationsShowPage)

    Page.checkForSuccessBanner('Capacity updated', 'You have updated the capacity for A-1-001.')
  })

  it('has a back link to details', () => {
    page.backLink().click()

    Page.verifyOnPage(WorkingCapacityMismatchDetails)
  })

  it('has a cancel link to show location', () => {
    page.cancelLink().click()

    Page.verifyOnPage(ViewLocationsShowPage)
  })

  it('does not say the capacity was updated when the change was sent for approval instead', () => {
    LocationsApiStubber.stub.stubUpdateCapacity()

    page.saveButton().click()
    Page.verifyOnPage(ViewLocationsShowPage)

    Page.checkForSuccessBanner(
      'Change request sent',
      'The capacity for A-1-001 has not changed yet. You have submitted a request to update the cell certificate.',
    )
  })
})

context('Working Capacity Mismatch - Confirm, when the maximum capacity also differs from the certificate', () => {
  it('shows the certified maximum capacity and the change to it', () => {
    setupStubs('MANAGE_RES_LOCATIONS_OP_CAP', cellWithMaxCapacityMismatch)
    const page = goToConfirm()

    cy.get('.govuk-summary-list').should('contain.text', 'Maximum capacity').and('contain.text', '2')
    cy.get('.change-summary').should('contain.text', 'You are decreasing the cell’s maximum capacity by 1.')

    page.saveButton().click()
    Page.verifyOnPage(ViewLocationsShowPage)
    Page.checkForSuccessBanner('Capacity updated', 'You have updated the capacity for A-1-001.')
  })
})
