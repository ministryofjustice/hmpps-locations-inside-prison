import Page from '../../../../pages/page'
import ViewLocationsShowPage from '../../../../pages/viewLocations/show'
import { setupStubs, location } from './setupStubs'
import UpdateSignedOpCapIsUpdateNeededPage from '../../../../pages/commonTransactions/updateSignedOpCap/isUpdateNeeded'
import goToUpdateSignedOpCapIsUpdateNeeded from '../goToUpdateSignedOpCapIsUpdateNeeded'
import UpdateSignedOpCapDetailsPage from '../../../../pages/commonTransactions/updateSignedOpCap/details'
import SubmitCertificationApprovalRequestPage from '../../../../pages/commonTransactions/submitCertificationApprovalRequest'
import CertChangeDisclaimerPage from '../../../../pages/commonTransactions/certChangeDisclaimer'
import capFirst from '../../../../../server/formatters/capFirst'

context('Certification Reactivation - Cell - Update signed op cap', () => {
  let page: UpdateSignedOpCapIsUpdateNeededPage

  beforeEach(() => {
    setupStubs('MANAGE_RES_LOCATIONS_OP_CAP')

    page = goToUpdateSignedOpCapIsUpdateNeeded(location)
  })

  it('displays the correct validation error when no option is selected', () => {
    page.submit({})

    Page.checkForError('update-signed-op-cap_isUpdateNeeded', 'Select if you need to update the operational capacity')
  })

  it('flows through to submit when yes is selected', () => {
    page.submit({ updateNeeded: true })
    const detailsPage = Page.verifyOnPage(UpdateSignedOpCapDetailsPage)

    detailsPage.submit({ opCap: 10, explanation: 'Op cap update was needed' })
    Page.verifyOnPage(SubmitCertificationApprovalRequestPage)
  })

  it('continues to submit when no is selected', () => {
    page.submit({ updateNeeded: false })
    Page.verifyOnPage(SubmitCertificationApprovalRequestPage)
  })

  it('has a back link to cert change disclaimer', () => {
    page.backLink().click()

    // eslint-disable-next-line no-new
    new CertChangeDisclaimerPage(`${capFirst(location.locationType.toLowerCase())} activation`)
  })

  it('has a cancel link to the view location show page', () => {
    page.cancelLink().click()
    Page.verifyOnPage(ViewLocationsShowPage)
  })
})
