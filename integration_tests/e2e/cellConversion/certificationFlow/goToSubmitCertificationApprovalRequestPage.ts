import Page from '../../../pages/page'
import SubmitCertificationApprovalRequestPage from '../../../pages/commonTransactions/submitCertificationApprovalRequest'
import goToSanitationPage from './goToSanitationPage'

export default function goToSubmitCertificationApprovalRequestPage() {
  const sanitationPage = goToSanitationPage()
  sanitationPage.radioButton('YES').click()
  sanitationPage.continueButton().click()
  return Page.verifyOnPage(SubmitCertificationApprovalRequestPage)
}
