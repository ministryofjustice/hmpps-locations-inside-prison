import Page from '../../../../pages/page'
import SubmitCertificationApprovalRequestPage from '../../../../pages/commonTransactions/submitCertificationApprovalRequest'
import goToDetails from './goToDetails'

export default function goToSubmitCertificationApprovalRequest() {
  goToDetails().submit({
    reason: 'TEST1',
    reasonDescription: 'Wing temporarily unavailable',
    day: '12',
    month: '12',
    year: '2045',
    reference: '123456',
    explanation: 'Certified working capacity must be decreased',
  })
  return Page.verifyOnPage(SubmitCertificationApprovalRequestPage)
}
