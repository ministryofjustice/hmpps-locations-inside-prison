import Page from '../../../../pages/page'
import ViewLocationsShowPage from '../../../../pages/viewLocations/show'
import { setupStubs } from './setupStubs'
import UpdateSignedOpCapIsUpdateNeededPage from '../../../../pages/commonTransactions/updateSignedOpCap/isUpdateNeeded'
import UpdateSignedOpCapDetailsPage from '../../../../pages/commonTransactions/updateSignedOpCap/details'
import goToSignedOpCapUpdateDetails from './goToSignedOpCapUpdateDetails'

context('Certification Deactivation - Wing - Signed op cap update details', () => {
  let page: UpdateSignedOpCapDetailsPage

  beforeEach(() => {
    setupStubs('MANAGE_RES_LOCATIONS_OP_CAP')

    page = goToSignedOpCapUpdateDetails()
  })

  it('has a cancel link', () => {
    page.cancelLink().click()

    Page.verifyOnPage(ViewLocationsShowPage)
  })

  it('has a back link', () => {
    page.backLink().click()

    Page.verifyOnPage(UpdateSignedOpCapIsUpdateNeededPage)
  })

  context('validation errors', () => {
    it('displays the correct error(s) for required', () => {
      page.submit({})

      Page.checkForError('update-signed-op-cap_newSignedOpCap', 'Enter a new signed operational capacity')
      Page.checkForError(
        'update-signed-op-cap_explanation',
        'Explain why you need to update the signed operational capacity',
      )
    })

    it('displays the correct error(s) for numeric', () => {
      page.submit({ opCap: 'abc' as never, explanation: 'Op cap changed' })

      Page.checkForError('update-signed-op-cap_newSignedOpCap', 'New signed operational capacity must be a number')
    })

    it('displays the correct error(s) for notEqual', () => {
      page.submit({ opCap: 11, explanation: 'Op cap changed' })

      Page.checkForError('update-signed-op-cap_newSignedOpCap', 'Enter a different signed operational capacity')
    })
  })
})
