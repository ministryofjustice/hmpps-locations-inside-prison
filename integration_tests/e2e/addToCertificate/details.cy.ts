import setupStubs from './setupStubs'
import Page from '../../pages/page'
import ViewLocationsShowPage from '../../pages/viewLocations/show'
import SubmitCertificationApprovalRequestPage from '../../pages/commonTransactions/submitCertificationApprovalRequest'
import UpdateSignedOpCapIsUpdateNeededPage from '../../pages/commonTransactions/updateSignedOpCap/isUpdateNeeded'
import UpdateSignedOpCapDetailsPage from '../../pages/commonTransactions/updateSignedOpCap/details'
import goToUpdateSignedOpCapDetails from './goToUpdateSignedOpCapDetails'

context('Add To Certificate - Update Signed Operational Capacity - Details', () => {
  let page: UpdateSignedOpCapDetailsPage

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs(['MANAGE_RES_LOCATIONS_OP_CAP'])
      page = goToUpdateSignedOpCapDetails('7e570000-0000-1000-8000-000000000200')
    })

    it('displays the correct validation errors when no values are entered', () => {
      page.submit({})

      Page.checkForError('update-signed-op-cap_newSignedOpCap', 'Enter a new signed operational capacity')
      Page.checkForError(
        'update-signed-op-cap_explanation',
        'Explain why you need to update the signed operational capacity',
      )
    })

    it('displays the correct validation error when new op cap is higher than prison max cap', () => {
      page.submit({ opCap: 281, explanation: 'Dave told me to do it' })

      Page.checkForError(
        'update-signed-op-cap_newSignedOpCap',
        "New signed operational capacity cannot be more than the establishment's maximum capacity",
      )
    })

    it('continues to submit when validation passes', () => {
      page.submit({ opCap: 280, explanation: 'Dave told me to do it' })
      Page.verifyOnPage(SubmitCertificationApprovalRequestPage)
    })

    it('has a back link to is update needed', () => {
      page.backLink().click()
      Page.verifyOnPage(UpdateSignedOpCapIsUpdateNeededPage)
    })

    it('has a cancel link to the view location show page', () => {
      page.cancelLink().click()
      Page.verifyOnPage(ViewLocationsShowPage)
    })
  })
})
