import setupStubs from './setupStubs'
import Page from '../../../pages/page'
import ViewLocationsShowPage from '../../../pages/viewLocations/show'
import UpdateSignedOpCapIsUpdateNeededPage from '../../../pages/commonTransactions/updateSignedOpCap/isUpdateNeeded'
import UpdateSignedOpCapDetailsPage from '../../../pages/commonTransactions/updateSignedOpCap/details'
import SubmitCertificationApprovalRequestPage from '../../../pages/commonTransactions/submitCertificationApprovalRequest'
import goToUpdateSignedOpCapDetailsPage from './goToUpdateSignedOpCapDetailsPage'

context('Non-residential conversion - Cert flow - Signed op cap update details', () => {
  let page: UpdateSignedOpCapDetailsPage

  context('With MANAGE_RES_LOCATIONS_OP_CAP role', () => {
    beforeEach(() => {
      setupStubs()
      page = goToUpdateSignedOpCapDetailsPage()
    })

    it('has a back link to the update needed page', () => {
      page.backLink().click()

      Page.verifyOnPage(UpdateSignedOpCapIsUpdateNeededPage)
    })

    it('has a cancel link to the view location show page', () => {
      page.cancelLink().click()

      Page.verifyOnPage(ViewLocationsShowPage)
    })

    it('shows a validation error when nothing is entered', () => {
      page.submit({})

      Page.checkForError('update-signed-op-cap_newSignedOpCap', 'Enter a new signed operational capacity')
      Page.checkForError(
        'update-signed-op-cap_explanation',
        'Explain why you need to update the signed operational capacity',
      )
    })

    it('shows a validation error when the signed operational capacity is not a number', () => {
      page.submit({ opCap: 'abc' as never, explanation: 'Reducing the signed operational capacity' })

      Page.checkForError('update-signed-op-cap_newSignedOpCap', 'New signed operational capacity must be a number')
    })

    it('shows a validation error when the signed operational capacity is unchanged', () => {
      page.submit({ opCap: 9, explanation: 'Reducing the signed operational capacity' })

      Page.checkForError('update-signed-op-cap_newSignedOpCap', 'Enter a different signed operational capacity')
    })

    it('continues to the submit certification approval request page when valid data is submitted', () => {
      page.submit({ opCap: 7, explanation: 'Reducing the signed operational capacity' })

      Page.verifyOnPage(SubmitCertificationApprovalRequestPage)
    })
  })
})
