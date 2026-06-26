import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import { isUndefined } from 'lodash'

export default function approvalCellWouldBeOvercrowded(req: FormWizard.Request, res: Response) {
  if (req.sessionModel.get<string>('approveOrReject') !== 'APPROVE') return false

  const { approvalRequest, prisonerLocation } = res.locals
  if (!approvalRequest) return false

  const occupants = prisonerLocation?.prisoners?.length || 0
  const proposedLocation = approvalRequest.locations?.[0]
  if (!proposedLocation) return false

  const proposedMaxCapacity = proposedLocation.maxCapacity
  if (!isUndefined(proposedMaxCapacity) && occupants > proposedMaxCapacity) return true

  const proposedWorkingCapacity = proposedLocation.workingCapacity
  if (
    !isUndefined(proposedWorkingCapacity) &&
    proposedLocation.locationType === 'CELL' &&
    proposedLocation.accommodationTypes?.includes('NORMAL_ACCOMMODATION') &&
    occupants > proposedWorkingCapacity
  ) {
    return true
  }

  return false
}
