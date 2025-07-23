import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { PrisonResidentialSummary } from '../data/types/locationsApi'

export default async function getPrisonResidentialSummary(
  req: FormWizard.Request,
  res: Response,
  next: NextFunction | null,
) {
  res.locals.prisonResidentialSummary = (await req.services.locationsService.getResidentialSummary(
    req.session.systemToken,
    (res.locals.location || res.locals.decoratedLocation).prisonId,
  )) as PrisonResidentialSummary

  if (next) {
    next()
  }
}
