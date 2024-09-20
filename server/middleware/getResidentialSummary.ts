import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'

export default async function getResidentialSummary(req: FormWizard.Request, res: Response, next: NextFunction) {
  const { user } = res.locals
  const { locationsService } = req.services

  const token = await req.services.authService.getSystemClientToken(user.username)
  res.locals.residentialSummary = await locationsService.getResidentialSummary(token, res.locals.location.prisonId)

  next()
}
