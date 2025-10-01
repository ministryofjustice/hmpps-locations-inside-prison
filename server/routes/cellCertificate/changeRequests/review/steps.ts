import FormWizard from 'hmpo-form-wizard'
import Review from '../../../../controllers/cellCertificate/changeRequests/review'
import Approve from '../../../../controllers/cellCertificate/changeRequests/review/approve'
import Reject from '../../../../controllers/cellCertificate/changeRequests/review/reject'

const steps: FormWizard.Steps = {
  '/': {
    backLink: (_req, res) => `/${res.locals.approvalRequest.prisonId}/cell-certificate/change-requests`,
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: 'review',
  },
  '/review': {
    fields: ['approveOrReject'],
    controller: Review,
    next: [{ field: 'approveOrReject', op: '==', value: 'APPROVE', next: 'approve' }, 'reject'],
  },
  '/approve': {
    pageTitle: 'You are about to approve a change to the cell certificate',
    fields: ['cellsMeetStandards'],
    controller: Approve,
  },
  '/reject': {
    pageTitle: 'Reject change request',
    fields: ['explanation'],
    controller: Reject,
  },
}

export default steps
