import { NextFunction, Request, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'

export default async function populateConstants(
  req: Request | FormWizard.Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { locationsService } = req.services
  const { systemToken } = req.session

  res.locals.accommodationTypeConstants = await locationsService.getAccommodationTypes(systemToken)
  res.locals.approvalTypeConstants = await locationsService.getApprovalTypes(systemToken)
  res.locals.specialistCellTypesObject = await locationsService.getSpecialistCellTypes(systemToken)
  res.locals.usedForConstants = await locationsService.getUsedForTypes(systemToken)

  return next()
}
