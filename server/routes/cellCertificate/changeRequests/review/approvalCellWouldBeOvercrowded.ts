import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'

export default function approvalCellWouldBeOvercrowded(req: FormWizard.Request, res: Response) {
  if (req.sessionModel.get<string>('approveOrReject') !== 'APPROVE') return false

  const { approvalRequest, prisonerLocation } = res.locals
  if (approvalRequest?.approvalType !== 'CAPACITY_CHANGE') return false

  const occupants = prisonerLocation?.prisoners?.length || 0
  const proposedWorkingCapacity = Number(approvalRequest.locations?.[0]?.workingCapacity) || 0

  return occupants > proposedWorkingCapacity
}
