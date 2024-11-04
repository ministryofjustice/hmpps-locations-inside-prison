import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'

export default async function getLocationResidentialSummary(
  req: FormWizard.Request,
  res: Response,
  next: NextFunction,
) {
  const { location, user } = res.locals
  const { id, prisonId } = location
  const { authService, locationsService } = req.services

  const token = await authService.getSystemClientToken(user.username)
  res.locals.locationResidentialSummary = await locationsService.getResidentialSummary(token, prisonId, id)

  next()
}
