import { type NextFunction, Request, type Response } from 'express'
import { isValidUUID } from '../utils/isValidUUID'

export default async function populatePrisonAndLocationId(req: Request, res: Response, next: NextFunction) {
  let { locationId, prisonId } = req.params

  if (req.params.prisonOrLocationId) {
    const isLocationId = isValidUUID(req.params.prisonOrLocationId as string)
    if (isLocationId) {
      locationId = req.params.prisonOrLocationId as string
    } else {
      prisonId = prisonId || req.params.prisonOrLocationId
    }
  }

  if (locationId && !prisonId) {
    const { locationsService } = req.services
    const location = await locationsService.getLocation(req.session.systemToken, locationId as string)
    prisonId = location.prisonId
  }

  res.locals.prisonId = (prisonId as string) || res.locals.user.activeCaseload.id
  res.locals.locationId = locationId as string

  next()
}
