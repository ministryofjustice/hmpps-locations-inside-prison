import setupStubs from './setupStubs'
import Page from '../../pages/page'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import CertChangeDisclaimerPage from '../../pages/commonTransactions/certChangeDisclaimer'
import SubmitCertificationApprovalRequestPage from '../../pages/commonTransactions/submitCertificationApprovalRequest'
import goToUpdateSignedOpCapIsUpdateNeeded from './goToUpdateSignedOpCapIsUpdateNeeded'
import UpdateSignedOpCapIsUpdateNeededPage from '../../pages/commonTransactions/updateSignedOpCap/isUpdateNeeded'
import UpdateSignedOpCapDetailsPage from '../../pages/commonTransactions/updateSignedOpCap/details'

context('Add To Certificate - Update Signed Operational Capacity - Is Update Needed', () => {
  let page: UpdateSignedOpCapIsUpdateNeededPage

  context('With MANAGE_RESIDENTIAL_LOCATIONS role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RESIDENTIAL_LOCATIONS'])
      page = goToUpdateSignedOpCapIsUpdateNeeded('7e570000-0000-1000-8000-000000000200')
    })

    it('displays the correct validation error when no option is selected', () => {
      page.submit({})

      page.checkForError('update-signed-op-cap_isUpdateNeeded', 'Select if you need to update the operational capacity')
    })

    it('continues to details when yes is selected', () => {
      page.submit({ updateNeeded: true })
      Page.verifyOnPage(UpdateSignedOpCapDetailsPage)
    })

    it('continues to submit when no is selected', () => {
      page.submit({ updateNeeded: false })
      Page.verifyOnPage(SubmitCertificationApprovalRequestPage)
    })

    it('has a back link to cert change disclaimer', () => {
      page.backLink().click()
      Page.verifyOnPage(CertChangeDisclaimerPage)
    })

    it('has a cancel link to the view location show page', () => {
      page.cancelLink().click()
      Page.verifyOnPage(ViewLocationsShowPage)
    })
  })
})
