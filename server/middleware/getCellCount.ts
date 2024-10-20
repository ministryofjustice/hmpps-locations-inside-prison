import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'

export default async function getCellCount(req: FormWizard.Request, res: Response, next: NextFunction) {
  const { user, location } = res.locals
  const { authService, locationsService } = req.services

  let cellCount = 1

  if (location.raw.locationType !== 'CELL') {
    const token = await authService.getSystemClientToken(user.username)
    const residentialSummary = await locationsService.getResidentialSummary(token, location.prisonId, location.id)

    cellCount =
      residentialSummary.parentLocation.numberOfCellLocations - residentialSummary.parentLocation.inactiveCells
  }
  res.locals.cellCount = cellCount

  next()
}
