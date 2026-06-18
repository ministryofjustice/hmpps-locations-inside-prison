import Page from '../../../pages/page'
import SubmitCertificationApprovalRequestPage from '../../../pages/commonTransactions/submitCertificationApprovalRequest'
import goToUpdateSignedOpCapDetailsPage from './goToUpdateSignedOpCapDetailsPage'
import goToUpdateSignedOpCapIsUpdateNeededPage from './goToUpdateSignedOpCapIsUpdateNeededPage'

const goToSubmitCertificationApprovalRequestPage = (updateNeeded = false) => {
  if (updateNeeded) {
    goToUpdateSignedOpCapDetailsPage().submit({ opCap: 8, explanation: 'Updating the signed operational capacity' })
  } else {
    goToUpdateSignedOpCapIsUpdateNeededPage().submit({ updateNeeded: false })
  }

  return Page.verifyOnPage(SubmitCertificationApprovalRequestPage)
}

export default goToSubmitCertificationApprovalRequestPage
