import Page from '../../../pages/page'
import { Location } from '../../../../server/data/types/locationsApi'
import goToCertChangeDisclaimer from './goToCertChangeDisclaimer'
import SubmitCertificationApprovalRequestPage from '../../../pages/commonTransactions/submitCertificationApprovalRequest'

const goToSubmitCertificationApprovalRequest = (location: Location) => {
  goToCertChangeDisclaimer(location).submit()
  return Page.verifyOnPage(SubmitCertificationApprovalRequestPage)
}

export default goToSubmitCertificationApprovalRequest
