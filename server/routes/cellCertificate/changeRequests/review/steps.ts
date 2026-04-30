import FormWizard from 'hmpo-form-wizard'
import Review from '../../../../controllers/cellCertificate/changeRequests/review'
import Approve from '../../../../controllers/cellCertificate/changeRequests/review/approve'
import Reject from '../../../../controllers/cellCertificate/changeRequests/review/reject'
import approvalCellWouldBeOvercrowded from './approvalCellWouldBeOvercrowded'
import FormInitialStep from '../../../../controllers/base/formInitialStep'

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
    next: [
      { fn: approvalCellWouldBeOvercrowded, next: 'too-many-occupants' },
      { field: 'approveOrReject', op: '==', value: 'APPROVE', next: 'approve' },
      'reject',
    ],
  },
  '/approve': {
    pageTitle: 'You are about to approve a change to the cell certificate',
    fields: ['confirmation'],
    controller: Approve,
    // only used as a fallback - Approve redirects away if cell won't be overcrowded
    next: 'too-many-occupants',
  },
  '/reject': {
    pageTitle: 'Reject change request',
    fields: ['explanation'],
    controller: Reject,
  },
  '/too-many-occupants': {
    pageTitle: 'You can’t approve this change because too many people are occupying the cell',
    controller: FormInitialStep,
  },
}

export default steps
