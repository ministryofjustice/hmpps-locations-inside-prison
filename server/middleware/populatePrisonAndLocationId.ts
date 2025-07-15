import { type NextFunction, Request, type Response } from 'express'
import { isValidUUID } from '../utils/isValidUUID'

export default async function populatePrisonAndLocationId(req: Request, res: Response, next: NextFunction) {
  let { locationId, prisonId } = req.params

  if (req.params.prisonOrLocationId) {
    const isLocationId = isValidUUID(req.params.prisonOrLocationId)
    if (isLocationId) {
      locationId = req.params.prisonOrLocationId
    } else {
      prisonId = prisonId || req.params.prisonOrLocationId
    }
  }

  if (locationId && !prisonId) {
    const { locationsService } = req.services
    const location = await locationsService.getLocation(req.session.systemToken, locationId)
    prisonId = location.prisonId
  }

  res.locals.prisonId = prisonId || res.locals.user.activeCaseload.id
  res.locals.locationId = locationId

  next()
}
