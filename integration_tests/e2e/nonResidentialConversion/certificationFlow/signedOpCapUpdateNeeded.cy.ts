import setupStubs from './setupStubs'
import Page from '../../../pages/page'
import ViewLocationsShowPage from '../../../pages/viewLocations/show'
import NonResidentialConversionDetailsPage from '../../../pages/nonResidentialConversion/details'
import UpdateSignedOpCapIsUpdateNeededPage from '../../../pages/commonTransactions/updateSignedOpCap/isUpdateNeeded'
import UpdateSignedOpCapDetailsPage from '../../../pages/commonTransactions/updateSignedOpCap/details'
import SubmitCertificationApprovalRequestPage from '../../../pages/commonTransactions/submitCertificationApprovalRequest'
import goToUpdateSignedOpCapIsUpdateNeededPage from './goToUpdateSignedOpCapIsUpdateNeededPage'

context('Non-residential conversion - Cert flow - Signed op cap update needed', () => {
  let page: UpdateSignedOpCapIsUpdateNeededPage

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs()
      page = goToUpdateSignedOpCapIsUpdateNeededPage()
    })

    it('has a back link to the details page', () => {
      page.backLink().click()

      Page.verifyOnPage(NonResidentialConversionDetailsPage)
    })

    it('has a cancel link to the view location show page', () => {
      page.cancelLink().click()

      Page.verifyOnPage(ViewLocationsShowPage)
    })

    it('shows a validation error when nothing is selected', () => {
      page.submit({})

      Page.checkForError('update-signed-op-cap_isUpdateNeeded', 'Select if you need to update the operational capacity')
    })

    it('continues to the details page when yes is selected', () => {
      page.submit({ updateNeeded: true })

      Page.verifyOnPage(UpdateSignedOpCapDetailsPage)
    })

    it('continues to the submit certification approval request page when no is selected', () => {
      page.submit({ updateNeeded: false })

      Page.verifyOnPage(SubmitCertificationApprovalRequestPage)
    })
  })
})
