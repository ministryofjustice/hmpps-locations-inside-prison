import { setupStubs } from './setupStubs'
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
})
