import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { LocationResidentialSummary } from '../data/types/locationsApi'

export default async function getCellCount(req: FormWizard.Request, res: Response, next: NextFunction) {
  const { systemToken } = req.session
  const { decoratedLocation } = res.locals
  let { location } = res.locals
  const { locationsService } = req.services

  if (!location) {
    location = decoratedLocation.raw
  }

  let cellCount = 1

  if (location.locationType !== 'CELL') {
    const residentialSummary = (await locationsService.getResidentialSummary(
      systemToken,
      location.prisonId,
      location.id,
    )) as LocationResidentialSummary

    cellCount =
      residentialSummary.parentLocation.numberOfCellLocations - residentialSummary.parentLocation.inactiveCells
  }
  res.locals.cellCount = cellCount

  next()
}
