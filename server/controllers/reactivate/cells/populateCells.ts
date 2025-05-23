import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'

export default async function populateCells(req: FormWizard.Request, res: Response, next: NextFunction) {
  const { systemToken } = req.session
  const { locationsService } = req.services
  const selectedLocations: string[] = req.sessionModel.get('selectedLocations') as string[]

  res.locals.cells = await Promise.all(selectedLocations.map(id => locationsService.getLocation(systemToken, id)))

  next()
}
