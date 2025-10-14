import Page from '../../pages/page'
import goToUpdateSignedOpCapIsUpdateNeeded from './goToUpdateSignedOpCapIsUpdateNeeded'
import goToUpdateSignedOpCapAlreadyRequested from './goToUpdateSignedOpCapAlreadyRequested'
import goToUpdateSignedOpCapDetails from './goToUpdateSignedOpCapDetails'
import SubmitCertificationApprovalRequestPage from '../../pages/commonTransactions/submitCertificationApprovalRequest'

const goToSubmitCertificationApprovalRequest = (
  locationId: string,
  options?: { alreadyRequested: true } | { opCap: number; explanation: string },
) => {
  if (!options) {
    goToUpdateSignedOpCapIsUpdateNeeded(locationId).submit({ updateNeeded: false })
  } else if ('alreadyRequested' in options) {
    goToUpdateSignedOpCapAlreadyRequested(locationId).submit()
  } else {
    goToUpdateSignedOpCapDetails(locationId).submit({ opCap: options.opCap, explanation: options.explanation })
  }

  return Page.verifyOnPage(SubmitCertificationApprovalRequestPage)
}

export default goToSubmitCertificationApprovalRequest
