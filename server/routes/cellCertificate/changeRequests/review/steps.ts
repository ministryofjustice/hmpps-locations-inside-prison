import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import Review from '../../../../controllers/cellCertificate/changeRequests/review'
import Approve from '../../../../controllers/cellCertificate/changeRequests/review/approve'
import Reject from '../../../../controllers/cellCertificate/changeRequests/review/reject'
import TooManyOccupants from '../../../../controllers/cellCertificate/changeRequests/review/tooManyOccupants'

function approvalCellWouldBeOvercrowded(req: FormWizard.Request, res: Response): boolean {
  if (req.form.values?.approveOrReject !== 'APPROVE') return false

  const { approvalRequest, prisonerLocation } = res.locals
  if (approvalRequest?.approvalType !== 'CAPACITY_CHANGE') return false

  const occupants = prisonerLocation?.prisoners?.length ?? 0
  const proposedWorkingCapacity = approvalRequest.locations?.[0]?.workingCapacity

  return typeof proposedWorkingCapacity === 'number' && occupants > proposedWorkingCapacity
}

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
  },
  '/reject': {
    pageTitle: 'Reject change request',
    fields: ['explanation'],
    controller: Reject,
  },
  '/too-many-occupants': {
    pageTitle: 'You can’t approve this change because too many people are occupying the cell',
    controller: TooManyOccupants,
  },
}

export default steps
