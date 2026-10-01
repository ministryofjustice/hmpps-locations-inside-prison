import Page from '../../../pages/page'
import goToCertChangeDisclaimer from './goToCertChangeDisclaimer'
import SubmitCertificationApprovalRequestPage from '../../../pages/commonTransactions/submitCertificationApprovalRequest'

const goToSubmitCertificationApprovalRequest = (locationId: string) => {
  goToCertChangeDisclaimer(locationId).submit()
  return Page.verifyOnPage(SubmitCertificationApprovalRequestPage)
}

export default goToSubmitCertificationApprovalRequest
