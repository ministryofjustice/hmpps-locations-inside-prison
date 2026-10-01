import Page from '../../pages/page'
import goToCertChangeDisclaimer from './goToCertChangeDisclaimer'
import SubmitCertificationApprovalRequestPage from '../../pages/commonTransactions/submitCertificationApprovalRequest'

const goToSubmitCertificationApprovalRequest = () => {
  goToCertChangeDisclaimer().submit()
  return Page.verifyOnPage(SubmitCertificationApprovalRequestPage)
}

export default goToSubmitCertificationApprovalRequest
