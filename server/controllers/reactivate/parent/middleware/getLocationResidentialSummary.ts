import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { LocationResidentialSummary } from '../../../../data/types/locationsApi'

export default async function getLocationResidentialSummary(
  req: FormWizard.Request,
  res: Response,
  next: NextFunction | null,
) {
  res.locals.locationResidentialSummary = (await req.services.locationsService.getResidentialSummary(
    req.session.systemToken,
    (res.locals.location || res.locals.decoratedLocation).prisonId,
    (res.locals.location || res.locals.decoratedLocation).id,
  )) as LocationResidentialSummary

  if (next) {
    next()
  }
}
