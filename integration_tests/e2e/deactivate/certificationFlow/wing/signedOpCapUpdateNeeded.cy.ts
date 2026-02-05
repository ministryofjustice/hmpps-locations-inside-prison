import Page from '../../../../pages/page'
import ViewLocationsShowPage from '../../../../pages/viewLocations/show'
import { setupStubs } from './setupStubs'
import goToSignedOpCapUpdateNeeded from './goToSignedOpCapUpdateNeeded'
import UpdateSignedOpCapIsUpdateNeededPage from '../../../../pages/commonTransactions/updateSignedOpCap/isUpdateNeeded'
import DeactivateTemporaryDetailsPage from '../../../../pages/deactivate/temporary/details'
import LocationsApiStubber from '../../../../mockApis/locationsApi'
import CertificationApprovalRequestFactory from '../../../../../server/testutils/factories/certificationApprovalRequest'
import UpdateSignedOpCapAlreadyRequestedPage from '../../../../pages/commonTransactions/updateSignedOpCap/alreadyRequested'

context('Certification Deactivation - Wing - Signed op cap update needed', () => {
  let page: UpdateSignedOpCapIsUpdateNeededPage

  beforeEach(() => {
    setupStubs('MANAGE_RES_LOCATIONS_OP_CAP')

    page = goToSignedOpCapUpdateNeeded()
  })

  it('has a cancel link', () => {
    page.cancelLink().click()

    Page.verifyOnPage(ViewLocationsShowPage)
  })

  it('has a back link', () => {
    page.backLink().click()

    Page.verifyOnPage(DeactivateTemporaryDetailsPage)
  })

  context('validation errors', () => {
    it('displays the correct error(s) for required', () => {
      page.submit({})

      Page.checkForError('update-signed-op-cap_isUpdateNeeded', 'Select if you need to update the operational capacity')
    })
  })

  context('when a signed op cap request is already active', () => {
    beforeEach(() => {
      LocationsApiStubber.stub.stubLocationsCertificationRequestApprovalsPrison([
        CertificationApprovalRequestFactory.build({
          approvalType: 'SIGNED_OP_CAP',
        }),
      ])
    })

    it('shows the already requested page', () => {
      page.submit({ updateNeeded: true })

      Page.verifyOnPage(UpdateSignedOpCapAlreadyRequestedPage)
    })
  })
})
