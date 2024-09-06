import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'

export default async function populateCells(req: FormWizard.Request, res: Response, next: NextFunction) {
  const { user } = res.locals
  const { authService, locationsService } = req.services
  const selectedLocations: string[] = req.sessionModel.get('selectedLocations') as string[]

  const token = await authService.getSystemClientToken(user.username)
  res.locals.cells = await Promise.all(selectedLocations.map(id => locationsService.getLocation(token, id)))

  next()
}
