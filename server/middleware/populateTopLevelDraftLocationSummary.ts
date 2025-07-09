import { NextFunction, Request, Response } from 'express'
import logger from '../../logger'
import { Location } from '../data/types/locationsApi'
import LocationsService from '../services/locationsService'

const getTopLevelDraftLocation = async (
  locationsService: LocationsService,
  systemToken: string,
  location: Location,
) => {
  if (location.parentId) {
    const drilledLocation = await locationsService.getLocation(systemToken, location.parentId, false)
    if (drilledLocation.status === 'DRAFT') {
      return getTopLevelDraftLocation(locationsService, systemToken, drilledLocation)
    }
  }

  return location
}

export default async function populateTopLevelDraftLocationSummary(
  req: Request,
  res: Response,
  next: NextFunction | null,
) {
  const { locationsService } = req.services
  const { location } = res.locals.decoratedResidentialSummary

  if (location.status !== 'DRAFT') {
    return next()
  }

  try {
    const { systemToken } = req.session

    const topLevelDraftLocation = await getTopLevelDraftLocation(locationsService, systemToken, location.raw)
    res.locals.topLevelDraftLocationSummary = await locationsService.getResidentialSummary(
      systemToken,
      topLevelDraftLocation.prisonId,
      topLevelDraftLocation.id,
    )
  } catch (error) {
    logger.error(
      error,
      `Failed to populate top level draft location summary for: prisonId: ${location?.prisonId}, locationId: ${location?.id}`,
    )
    next(error)
  }

  return next()
}
