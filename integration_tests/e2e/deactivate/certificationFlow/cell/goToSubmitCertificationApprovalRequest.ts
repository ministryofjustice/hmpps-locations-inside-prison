import Page from '../../../../pages/page'
import goToDetails from './goToDetails'
import SubmitCertificationApprovalRequestPage from '../../../../pages/commonTransactions/submitCertificationApprovalRequest'

export default function goToSubmitCertificationApprovalRequest() {
  goToDetails().submit({
    reason: 'TEST1',
    reasonDescription: 'Hole in cell wall',
    day: '12',
    month: '12',
    year: '2045',
    reference: '123456',
    explanation: 'The hole in the cell wall means the cell can no longer be certified as suitable for use.',
  })

  return Page.verifyOnPage(SubmitCertificationApprovalRequestPage)
}
