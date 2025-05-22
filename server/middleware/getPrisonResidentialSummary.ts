import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'

export default async function getPrisonResidentialSummary(
  req: FormWizard.Request,
  res: Response,
  next: NextFunction | null,
) {
  res.locals.prisonResidentialSummary = await req.services.locationsService.getResidentialSummary(
    req.session.systemToken,
    (res.locals.location || res.locals.decoratedLocation).prisonId,
  )

  if (next) {
    next()
  }
}
