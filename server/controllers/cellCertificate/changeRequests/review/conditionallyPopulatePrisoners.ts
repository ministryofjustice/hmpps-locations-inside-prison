import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import populatePrisonersInLocation from '../../../../middleware/populatePrisonersInLocation'

export default async function conditionallyPopulatePrisoners(
  req: FormWizard.Request,
  res: Response,
  next: NextFunction,
) {
  if (req.form.values?.approveOrReject !== 'APPROVE') {
    next()
    return
  }

  const { approvalRequest } = res.locals
  if (approvalRequest?.approvalType !== 'CAPACITY_CHANGE') {
    next()
    return
  }

  res.locals.locationId = approvalRequest.locationId
  await populatePrisonersInLocation()(req, res)

  next()
}
