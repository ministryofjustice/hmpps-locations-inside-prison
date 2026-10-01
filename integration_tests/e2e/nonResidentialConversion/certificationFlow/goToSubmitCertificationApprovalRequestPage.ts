import Page from '../../../pages/page'
import SubmitCertificationApprovalRequestPage from '../../../pages/commonTransactions/submitCertificationApprovalRequest'
import goToDetailsPage from './goToDetailsPage'

const goToSubmitCertificationApprovalRequestPage = () => {
  goToDetailsPage().submit({ convertedCellType: 'OFFICE', explanation: 'Want to change the room usage' })
  return Page.verifyOnPage(SubmitCertificationApprovalRequestPage)
}

export default goToSubmitCertificationApprovalRequestPage
